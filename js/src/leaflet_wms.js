/*!
 * leaflet.wms.js
 * A collection of Leaflet utilities for working with Web Mapping services.
 * (c) 2014-2016, Houston Engineering, Inc.
 * MIT License
 * adapted: Sebastian Geidel
 */

(function (factory) {
  // Browser globals
  if (typeof this.L === 'undefined')
      throw 'Leaflet must be loaded first!';
  // Namespace
  this.L.WMS = this.L.wms = factory(this.L);

}(function (L) {

// Module object
var wms = {};

/*
 * wms.Source
 * The Source object manages a single WMS connection.  Multiple "layers" can be
 * created with the getLayer function, but a single request will be sent for
 * each image update.  Can be used in non-tiled "overlay" mode (default), or
 * tiled mode, via an internal wms.Overlay or wms.TileLayer, respectively.
 */
wms.Source = L.Layer.extend({
    'options': {
        'untiled': true,
        'identify': false
    },

    'initialize': function(url, options) {
        L.setOptions(this, options);
        this._url = url;
        this._subLayers = {};
        this._overlay = this.createOverlay(this.options.untiled);
    },

    'createOverlay': function(untiled) {
        // Create overlay with all options other than untiled & identify
        var overlayOptions = {};
        for (var opt in this.options) {
            if (opt != 'untiled' && opt != 'identify') {
                overlayOptions[opt] = this.options[opt];
            }
        }
        if (untiled) {
            return wms.overlay(this._url, overlayOptions);
        } else {
            return wms.tileLayer(this._url, overlayOptions);
        }
    },

    'onAdd': function() {
        //this.refreshOverlay();
    },

    'setOpacity': function(opacity) {
         this.options.opacity = opacity;
         if (this._overlay) {
             this._overlay.setOpacity(opacity);
         }
    },

    'getLayer': function(name) {
        return wms.layer(this, name);
    },

    'addSubLayer': function(name) {
        this._subLayers[name] = true;
        this.refreshOverlay();
    },

    'removeSubLayer': function(name) {
        delete this._subLayers[name];
        this.refreshOverlay();
    },

    'refreshOverlay': function() {
        var subLayers = Object.keys(this._subLayers).join(",");

        //sightings always in back
        // subLayersArr = subLayers.split(",");
        // if (subLayersArr[1]=="sightings"){
        //     [subLayersArr[0], subLayersArr[1]] = [subLayersArr[1], subLayersArr[0]];
        //     subLayers = subLayersArr.join();
        // }

        if (!this._map) {
            return;
        }
        if (!subLayers) {
            this._overlay.remove();
        } else {
            this._overlay.setParams({'layers': subLayers});
            this._overlay.addTo(this._map);
        }
    }

});

wms.source = function(url, options) {
    return new wms.Source(url, options);
};

/*
 * Layer
 * Leaflet "layer" with all actual rendering handled via an underlying Source
 * object.  Can be called directly with a URL to automatically create or reuse
 * an existing Source.  Note that the auto-source feature doesn't work well in
 * multi-map environments; so for best results, create a Source first and use
 * getLayer() to retrieve wms.Layer instances.
 */

wms.Layer = L.Layer.extend({
    'initialize': function(source, layerName, options) {
        L.setOptions(this, options);
        if (!source.addSubLayer) {
            // Assume source is a URL
            source = wms.getSourceForUrl(source, options);
        }
        this._source = source;
        this._name = layerName;
    },
    'onAdd': function() {
        if (!this._source._map)
            this._source.addTo(this._map);
        this._source.addSubLayer(this._name);
    },
    'onRemove': function() {
        this._source.removeSubLayer(this._name);
    },
    'setOpacity': function(opacity) {
        this._source.setOpacity(opacity);
    }
});

wms.layer = function(source, options) {
    return new wms.Layer(source, options);
};

// Cache of sources for use with wms.Layer auto-source option
var sources = {};
wms.getSourceForUrl = function(url, options) {
    if (!sources[url]) {
        sources[url] = wms.source(url, options);
    }
    return sources[url];
};


/*
 * wms.Overlay:
 * "Single Tile" WMS image overlay that updates with map changes.
 * Portions of wms.Overlay are directly extracted from L.TileLayer.WMS.
 * See Leaflet license.
 */
wms.Overlay = L.Layer.extend({
    'defaultWmsParams': {
        'service': 'WMS',
        'request': 'GetMap',
        'version': '1.1.1',
        'layers': '',
        'styles': '',
        'format': 'image/jpeg',
        'transparent': false
    },

    'options': {
        'crs': null,
        'uppercase': false,
        'updateWhenIdle': true,
        'attribution': '',
        'opacity': 1
    },

    'initialize': function(url, options) {
        this._url = url;

        // Move WMS parameters to params object
        var params = {}, opts = {};
        for (var opt in options) {
             if (opt in this.options) {
                 opts[opt] = options[opt];
             } else {
                 params[opt] = options[opt];
             }
        }
        L.setOptions(this, opts);
        this.wmsParams = L.extend({}, this.defaultWmsParams, params);
    },

    'setParams': function(params) {
        L.extend(this.wmsParams, params);
        this.update();
    },

    'getAttribution': function() {
        return this.options.attribution;
    },

    'onAdd': function() {
        this.update();
    },

    'onRemove': function(map) {
        if (this._currentOverlay) {
            map.removeLayer(this._currentOverlay);
            delete this._currentOverlay;
        }
        if (this._currentUrl) {
            delete this._currentUrl;
        }
    },

    'getEvents': function() {
        return {
            'moveend': this.update
        };
    },

    'getLoading': function(layer,status) {
        if (['tk_vorkommen','tk_brutzeitcode','birddata'].includes(layer)){
            //show or hide loading animation gif
            (status == "start") ? $('.loading').show() : $('.loading').hide(); 
        }
    },

    'update': function() {
        if (!this._map) {
            return;
        }
        // Determine image URL and whether it has changed since last update
        this.updateWmsParams();
        var url = this.getImageUrl();
        if (this._currentUrl == url) {
            return;
        }
        this._currentUrl = url;

        //console.log('update');
        //start of loading tiles 
        this.getLoading(this.wmsParams.layers,'start');

        // Keep current image overlay in place until new one loads
        // (inspired by esri.leaflet)
        var bounds = this._map.getBounds();
        var opt= {'opacity': 0};

        //enable pane option
	    if (this.options.pane)
		     opt.pane=this.options.pane;

        var overlay = L.imageOverlay(url, bounds, opt);

        overlay.addTo(this._map);
        overlay.once('load', _swap, this);
        function _swap() {
            if (!this._map) {
                return;
            }
            if (overlay._url != this._currentUrl) {
                this._map.removeLayer(overlay);
                return;
            } else if (this._currentOverlay) {
                this._map.removeLayer(this._currentOverlay);
            }
            this._currentOverlay = overlay;
            overlay.setOpacity(
                this.options.opacity ? this.options.opacity : 1
            );
            //all tiles are loaded
            this.getLoading(this.wmsParams.layers,'end');
        }
        if ((this._map.getZoom() < this.options.minZoom) ||
            (this._map.getZoom() > this.options.maxZoom)){
            this._map.removeLayer(overlay);
        }
    },

    'setOpacity': function(opacity) {
         this.options.opacity = opacity;
         if (this._currentOverlay) {
             this._currentOverlay.setOpacity(opacity);
         }
    },

    // See L.TileLayer.WMS: onAdd() & getTileUrl()
    'updateWmsParams': function(map) {
        if (!map) {
            map = this._map;
        }
        // Compute WMS options
        var bounds = map.getBounds();
        var size = map.getSize();
        var wmsVersion = parseFloat(this.wmsParams.version);
        var crs = this.options.crs || map.options.crs;
        var projectionKey = wmsVersion >= 1.3 ? 'crs' : 'srs';
        var nw = crs.project(bounds.getNorthWest());
        var se = crs.project(bounds.getSouthEast());

        // Assemble WMS parameter string
        var params = {
            'width': size.x,
            'height': size.y
        };
        params[projectionKey] = crs.code;
        params.bbox = (
            wmsVersion >= 1.3 && crs === L.CRS.EPSG4326 ?
            [se.y, nw.x, nw.y, se.x] :
            [nw.x, se.y, se.x, nw.y]
        ).join(',');

        L.extend(this.wmsParams, params);
    },

    'getImageUrl': function() {
        var uppercase = this.options.uppercase || false;
        var pstr = L.Util.getParamString(this.wmsParams, this._url, uppercase);
        return this._url + pstr;
    }
});

wms.overlay = function(url, options) {
    return new wms.Overlay(url, options);
};

return wms;

}));