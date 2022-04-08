// create Pane for Z-indexing
map.createPane("vg250").style.zIndex = 200;
map.createPane("district").style.zIndex = 210;
map.createPane("dlm250").style.zIndex = 220;
map.createPane("natura2000").style.zIndex = 230;
map.createPane("sightings").style.zIndex = 400;
map.createPane("birddata").style.zIndex = 450;
map.createPane("tkgrid").style.zIndex = 500;


/* create Basemaps */

// no baselayer
var none = L.tileLayer("");

// BKG WebAtlasDE grau
var webatlas = L.tileLayer.wms(layersObject.bkg.url.webatlas, {
  version: "1.3.0",
  layers: layersObject.bkg.name.webatlas,
  attribution: layersObject.bkg.attr
}).addTo(map);

// OpenStreetMap
var osm = L.tileLayer(layersObject.osm.url, {
  attribution: layersObject.osm.attr,
  maxZoom: 14,
  minZoom: 8
});

// ESRI Satellite
var esri = L.tileLayer(layersObject.esri.url, {
  attribution: layersObject.esri.attr,
  maxZoom: 14,
  minZoom: 8
});

// Legend:
// (1) artificial land,
// (2) open soil,
// (3) high seasonal vegetation,
// (4) high perennial vegetation,
// (5) low seasonal vegetation,
// (6) low perennial vegetation and
// (7) water
var clc = L.tileLayer.wms(layersObject.dlr.url, {
  layers: layersObject.dlr.name,
  attribution: layersObject.dlr.attr
});

// Digitales Geländemodell DGM200
var relief = L.tileLayer.wms(layersObject.bkg.url.relief, {
  layers: layersObject.bkg.name.relief,
  attribution: layersObject.bkg.attr,
  maxZoom: 12
});

// Raster der vieljährigen Mittel der Lufttemperatur (2m) für Deutschland
var airtemp = L.tileLayer.wms(layersObject.dwd.url, {
  layers: layersObject.dwd.name.temp,
  attribution: layersObject.dwd.attr,
  maxZoom: 10
});

// Raster der vieljährigen Mittel der Niederschlagshöhe für Deutschland
var precip = L.tileLayer.wms(layersObject.dwd.url, {
  layers: layersObject.dwd.name.prec,
  attribution: layersObject.dwd.attr,
  maxZoom: 10
});


/* create Overlays */

// administrative boundaries used for displaying the borders when searching places
var district = L.WMS.overlay(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  layers: layersObject.mapserver.name.district,
  format: "image/png",
  pane: "district"
}).addTo(map);

// Natura 2000 network - Birds Directive
var natura2000 = L.WMS.overlay(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  layers: layersObject.mapserver.name.natura2000,
  format: "image/png",
  attribution: layersObject.mapserver.natura2000.attr,
  pane: "natura2000"
});

// administrative boundaries
var vg250 = L.WMS.source(layersObject.bkg.url.vg250, {
  transparent: true,
  format: layersObject.bkg.format,
  attribution: layersObject.bkg.attr,
  pane: "vg250"
});
// Staat
vg250.getLayer(layersObject.bkg.name.sta).addTo(map);
// Bundesländer
var vg250_lan = vg250.getLayer(layersObject.bkg.name.lan);
// Kreise
var vg250_krs = vg250.getLayer(layersObject.bkg.name.krs);
// Gemeinden
var vg250_gem = vg250.getLayer(layersObject.bkg.name.gem);

// TK Grid Layers
var tkgrid = L.WMS.source(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  format: "image/png",
  pane: "tkgrid"
});
// Tk50
var ref_tk50 = tkgrid.getLayer(layersObject.mapserver.name.tk50);
// Tk25
var ref_tk25 = tkgrid.getLayer(layersObject.mapserver.name.tk25);
// Tk25vrt
var ref_tk25vrt = tkgrid.getLayer(layersObject.mapserver.name.tk25vrt);

// Gewässer
var dlm250 = L.WMS.overlay(layersObject.bkg.url.dlm250, {
  transparent: true,
  layers: layersObject.bkg.name.hyd,
  format: "image/png",
  attribution: layersObject.bkg.attr,
  pane: "dlm250"
});

// Ornitho mapserver
// Vogeldaten - layer (Vorkommen and Brutzeitcode)
var birddata = L.WMS.overlay(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  layers: layersObject.mapserver.name.birdd,
  format: "image/png",
  pane: "birddata"
});

// Meldeaktivität - layer
var sightings = L.WMS.overlay(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  layers: layersObject.mapserver.name.sight,
  format: "image/png",
  pane: "sightings"
});


// wait for loading the data by mapserver
(async () => {
  await delay(1000);
  sightings.addTo(map);
  //default Grid
  setGridLayers("tk50");
})();


/* create leaflet layercontrol panel*/

var baseMaps = {
  "-Ohne-": none,
  "WebAtlasDE": webatlas,
  "OpenStreetMap": osm,
  "ESRI-Satellite": esri,
  "Landbedeckung": clc,
  "Lufttemperatur": airtemp,
  "Niederschlag": precip,
  "Relief": relief
};

var overlayMaps = {
  "Bundesländer": vg250_lan,
  "Kreise": vg250_krs,
  "Gemeinden": vg250_gem,
  "TK50 Raster": ref_tk50,
  "TK25 Raster": ref_tk25,
  "TK25/4 Raster": ref_tk25vrt,
  "Gewässer": dlm250,
  "Vogelschutzgebiete": natura2000,
  "Meldeaktivität": sightings
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
// insert header at top of layer control
$("<h2>Kartengrundlage</h2>").insertBefore("div.leaflet-control-layers-base");


// fired when an baselayer is changed through the layercontrol.
map.on("baselayerchange", function(eventLayer) {

  if (eventLayer.name == "Lufttemperatur") {
    $(".leaflet-legend-temp").show();
    $(".leaflet-legend-prec").hide();
  } else if (eventLayer.name == "Niederschlag") {
    $(".leaflet-legend-temp").hide();
    $(".leaflet-legend-prec").show();
  } else {
    $(".leaflet-legend-temp").hide();
    $(".leaflet-legend-prec").hide();
  }

});

// default values
var checked_tk50 = true,
  checked_tk25 = true,
  checked_tk25vrt = true;

// fired when an overlay is selected through the layercontrol.
map.on("overlayadd", function(eventLayer) {

  if ($(".leaflet-legend").children(":visible").length == 0 &&
    (eventLayer.name == "Meldeaktivität" || eventLayer.name == "Vogelschutzgebiete")) {
    $(".leaflet-legend").show();
  }

  if (eventLayer.name == "Meldeaktivität") {
    $(".leaflet-legend-beob").show();
  } else if (eventLayer.name == "Vogelschutzgebiete") {
    $(".leaflet-legend-spa").show();
  }

  if (eventLayer.name == "TK50 Raster") {
    checked_tk50 = true;
  }
  if (eventLayer.name == "TK25 Raster") {
    checked_tk25 = true;
  }
  if (eventLayer.name == "TK25/4 Raster") {
    checked_tk25vrt = true;
  }

});

// fired when an overlay is removed through the layercontrol.
map.on("overlayremove", function(eventLayer) {

  if (eventLayer.name == "Meldeaktivität") {
    $(".leaflet-legend-beob").hide();
  } else if (eventLayer.name == "Vogelschutzgebiete") {
    $(".leaflet-legend-spa").hide();
  }

  if ($(".leaflet-legend").children(":visible").length == 0) {
    $(".leaflet-legend").hide();
  }

  if (eventLayer.name == "TK50 Raster") {
    checked_tk50 = false;
  }
  if (eventLayer.name == "TK25 Raster") {
    checked_tk25 = false;
  }
  if (eventLayer.name == "TK25/4 Raster") {
    checked_tk25vrt = false;
  }

});

map.on("movestart zoomstart", function() {
  infoObject.grid_start = queryObject.grid;
});

// map.on('moveend', function() { 
//      console.log(map.getBounds());});

// define TK-Grid depending on zoomlevel
map.on("zoomend", function() {

  var zoomLevel = map.getZoom();

  switch (true) {
    //tk25
    case (zoomLevel >= 8 && zoomLevel < 10):

      if (queryObject.grid != "tk25") {
        queryObject.grid = "tk25";
        startSearchDB();
        setGridLayers("tk25");
      }

      break;

      //tk25vrt
    case (zoomLevel >= 10 && zoomLevel < 12):

      if (zoomLevel > 10 && (map.hasLayer(airtemp) || map.hasLayer(precip))) {
        $(".leaflet-control-layers-base").find("input:radio:nth(1)").prop("checked", true).trigger("click");
      }

      if (queryObject.grid != "tk25vrt") {
        queryObject.grid = "tk25vrt";
        startSearchDB();
        setGridLayers("tk25vrt");
      }

      break;

      //tk25hmf
    case zoomLevel >= 12:

      if (zoomLevel > 12 && map.hasLayer(relief)) {
        $(".leaflet-control-layers-base").find("input:radio:nth(1)").prop("checked", true).trigger("click");
      }

      if (queryObject.grid != "tk25hmf") {
        queryObject.grid = "tk25hmf";
        startSearchDB();
        setGridLayers("tk25hmf");
      }

      break;

      //tk50
    default:

      if (map.hasLayer(osm) || map.hasLayer(esri)) {
        $(".leaflet-control-layers-base").find("input:radio:nth(1)").prop("checked", true).trigger("click");
      }

      if (queryObject.grid != "tk50") {
        queryObject.grid = "tk50";
        startSearchDB();
        setGridLayers("tk50");
      }

  } //End switch

}); //End zoomend event


/* setGridLayers()
 * add or remove TK grid (tk50,tk25,tk25vrt) for additional orientation
 *
 */
function setGridLayers(gridLevel) {

  switch (gridLevel) {
    case "tk50":

      if (map.hasLayer(ref_tk50)) {
        map.removeLayer(ref_tk50);
        checked_tk50 = true;
      }
      if (map.hasLayer(ref_tk25)) {
        map.removeLayer(ref_tk25);
        checked_tk25 = true;
      }
      if (map.hasLayer(ref_tk25vrt)) {
        map.removeLayer(ref_tk25vrt);
        checked_tk25vrt = true;
      }
      $(".leaflet-control-layers-overlays > label:nth-child(4)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(5)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(6)").css("display", "none");

      break;

    case "tk25":

      if (!map.hasLayer(ref_tk50) && checked_tk50) {
        map.addLayer(ref_tk50);
      }
      $(".leaflet-control-layers-overlays > label:nth-child(4)").css("display", "inherit");

      if (map.hasLayer(ref_tk25)) {
        map.removeLayer(ref_tk25);
        checked_tk25 = true;
      }
      if (map.hasLayer(ref_tk25vrt)) {
        map.removeLayer(ref_tk25vrt);
        checked_tk25vrt = true;
      }
      $(".leaflet-control-layers-overlays > label:nth-child(5)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(6)").css("display", "none");

      break;

    case "tk25vrt":

      if (!map.hasLayer(ref_tk25) && checked_tk25) {
        map.addLayer(ref_tk25);
      }
      $(".leaflet-control-layers-overlays > label:nth-child(5)").css("display", "inherit");

      if (map.hasLayer(ref_tk50)) {
        map.removeLayer(ref_tk50);
        checked_tk50 = true;
      }
      if (map.hasLayer(ref_tk25vrt)) {
        map.removeLayer(ref_tk25vrt);
        checked_tk25vrt = true;
      }
      $(".leaflet-control-layers-overlays > label:nth-child(4)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(6)").css("display", "none");

      break;

    case "tk25hmf":

      if (!map.hasLayer(ref_tk25vrt) && checked_tk25vrt) {
        map.addLayer(ref_tk25vrt);
      }
      $(".leaflet-control-layers-overlays > label:nth-child(6)").css("display", "inherit");

      if (map.hasLayer(ref_tk50)) {
        map.removeLayer(ref_tk50);
        checked_tk50 = true;
      }
      if (map.hasLayer(ref_tk25)) {
        map.removeLayer(ref_tk25);
        checked_tk25 = true;
      }
      $(".leaflet-control-layers-overlays > label:nth-child(4)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(5)").css("display", "none");

      break;

    default:

  } // End switch

}; // End setGridLayers


// birdlayerConf for switching birdlayers style
var birdlayerConf = {
  "id": "VOR",
  "sld": ""
};

/* setBirdLayers()
 * add or remove birdlayers (vorkommen, brutzeitcode)
 *
 */
function setBirdLayers(layerId) {

  if (birdlayerConf.id != "NON") {
    (birdlayerConf.id == "VOR") ? $(".leaflet-legend-vorkommen").hide(): $(".leaflet-legend-bzcode").hide();
  }

  if (layerId == "NON") {
    map.removeLayer(birddata);
    
    if ($(".leaflet-legend").children(":visible").length == 0) {
      $(".leaflet-legend").hide();
    }
  } else {
    birdlayerConf.sld = (layerId == "VOR") ? "vorkommen.xml" : "brutzeitcode.xml";

    if (!map.hasLayer(birddata)) {
      birddata.wmsParams.sld = layersObject.mapserver.sld + birdlayerConf.sld;
      map.addLayer(birddata);
    } else {
      birddata.setParams({
        "sld": layersObject.mapserver.sld + birdlayerConf.sld
      });
    }
    
    if ($(".leaflet-legend").children(":visible").length == 0) {
      $(".leaflet-legend").show();
    }
    (layerId == "VOR") ? $(".leaflet-legend-vorkommen").show(): $(".leaflet-legend-bzcode").show();
  }

  birdlayerConf.id = layerId;
  infoMessage.setContent(formatInfoMessage());

};