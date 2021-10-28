// create Pane for Z-indexing
map.createPane("district").style.zIndex = 210;
map.createPane("sightings").style.zIndex = 400;
map.createPane("birddata").style.zIndex = 450;
map.createPane("tkgrid").style.zIndex = 500;


/* create Basemaps */

// no baselayer
var none = L.tileLayer("");

// OpenStreetMap
var osm = L.tileLayer(layersObject.osm.url, {
  attribution: layersObject.osm.attr,
  maxZoom: 14,
  minZoom: 6
}).addTo(map);

// Ornitho mapserver
// Vogeldaten - layer (Vorkommen and Brutzeitcode)
var vorkommen = L.WMS.overlay(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  layers: layersObject.mapserver.name.vorkommen,
  format: "image/png",
  pane: "birddata"
});

var brutstatus = L.WMS.overlay(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  layers: layersObject.mapserver.name.brutstatus,
  format: "image/png",
  pane: "birddata"
});

/* create Overlays */

// administrative boundaries used for displaying the borders when searching places
var district = L.WMS.overlay(layersObject.mapserver.url, {
  crs: L.CRS.EPSG3857,
  transparent: true,
  version: "1.3.0",
  layers: layersObject.mapserver.name.district,
  format: "image/png",
  pane: "district",
  lid: queryObject.lid
});

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
  startSearchDB();
  await delay(2000);
  district.addTo(map);
  vorkommen.addTo(map);
  sightings.addTo(map);
  setGridLayers(queryObject.grid);
})();

/* create leaflet layercontrol panel*/

var baseMaps = {
  "-Ohne-": none,
  "Vorkommen": vorkommen,
  "Brutstatus": brutstatus
};

var overlayMaps = {
  "TK50 Raster": ref_tk50,
  "TK25 Raster": ref_tk25,
  "TK25/4 Raster": ref_tk25vrt,
  "Meldeaktivität": sightings
};

var layerControl = L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(map);
// insert header at top of layer control
$("<h2>Kartengrundlage</h2>").insertBefore("div.leaflet-control-layers-base");


// fired when an baselayer is changed through the layercontrol.
map.on("baselayerchange", function(eventLayer) {

  if (eventLayer.name == "Vorkommen") {
    $(".leaflet-legend-vorkommen").show();
    $(".leaflet-legend-bzcode").hide();
  } else if (eventLayer.name == "Brutstatus") {
    $(".leaflet-legend-vorkommen").hide();
    $(".leaflet-legend-bzcode").show();
  } else {
    $(".leaflet-legend-vorkommen").hide();
    $(".leaflet-legend-bzcode").hide();
  }

});

// default values
var checked_tk50 = true,
  checked_tk25 = true,
  checked_tk25vrt = true;

// fired when an overlay is selected through the layercontrol.
map.on("overlayadd", function(eventLayer) {

  if (eventLayer.name == "Meldeaktivität") {
    $(".leaflet-legend-beob").show();
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
  } 

  // if ($(".leaflet-legend").children(":visible").length == 0) {
  //   $(".leaflet-legend").hide();
  // }

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

      if (queryObject.grid != "tk25vrt") {
        queryObject.grid = "tk25vrt";
        startSearchDB();
        setGridLayers("tk25vrt");
      }

      break;

      //tk25hmf
    case zoomLevel >= 12:

      if (queryObject.grid != "tk25hmf") {
        queryObject.grid = "tk25hmf";
        startSearchDB();
        setGridLayers("tk25hmf");
      }

      break;

      //tk50
    default:

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
      $(".leaflet-control-layers-overlays > label:nth-child(1)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(2)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(3)").css("display", "none");

      break;

    case "tk25":

      if (!map.hasLayer(ref_tk50) && checked_tk50) {
        map.addLayer(ref_tk50);
      }
      $(".leaflet-control-layers-overlays > label:nth-child(1)").css("display", "inherit");

      if (map.hasLayer(ref_tk25)) {
        map.removeLayer(ref_tk25);
        checked_tk25 = true;
      }
      if (map.hasLayer(ref_tk25vrt)) {
        map.removeLayer(ref_tk25vrt);
        checked_tk25vrt = true;
      }
      $(".leaflet-control-layers-overlays > label:nth-child(2)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(3)").css("display", "none");

      break;

    case "tk25vrt":

      if (!map.hasLayer(ref_tk25) && checked_tk25) {
        map.addLayer(ref_tk25);
      }
      $(".leaflet-control-layers-overlays > label:nth-child(2)").css("display", "inherit");

      if (map.hasLayer(ref_tk50)) {
        map.removeLayer(ref_tk50);
        checked_tk50 = true;
      }
      if (map.hasLayer(ref_tk25vrt)) {
        map.removeLayer(ref_tk25vrt);
        checked_tk25vrt = true;
      }
      $(".leaflet-control-layers-overlays > label:nth-child(1)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(3)").css("display", "none");

      break;

    case "tk25hmf":

      if (!map.hasLayer(ref_tk25vrt) && checked_tk25vrt) {
        map.addLayer(ref_tk25vrt);
      }
      $(".leaflet-control-layers-overlays > label:nth-child(3)").css("display", "inherit");

      if (map.hasLayer(ref_tk50)) {
        map.removeLayer(ref_tk50);
        checked_tk50 = true;
      }
      if (map.hasLayer(ref_tk25)) {
        map.removeLayer(ref_tk25);
        checked_tk25 = true;
      }
      $(".leaflet-control-layers-overlays > label:nth-child(1)").css("display", "none");
      $(".leaflet-control-layers-overlays > label:nth-child(2)").css("display", "none");

      break;

    default:

  } // End switch

}; // End setGridLayers