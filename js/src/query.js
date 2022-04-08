/* delay()
 *
 */
function delay(t) {
  return new Promise(resolve => {
    setTimeout(resolve, t);
  });
}

/* checkYear()
 * year_from should always be lower
 *
 */
function checkYear(year_from, year_to) {

  var swapYear = year_from > year_to;
  if (swapYear) {
    [queryObject.year[0], queryObject.year[1]] = [queryObject.year[1], queryObject.year[0]];
    $("#yearselector_from").val(year_to).trigger("change");
    $("#yearselector_to").val(year_from).trigger("change");
  }

  return year_select = (swapYear) ? year_to + "-" + year_from : year_from + "-" + year_to;

}

/* formatInfoMessage()
 * creates the info content in the top left of the map
 *
 */
function formatInfoMessage() {

  var season_select = infoObject.season_select;
  var year_from = queryObject.year[0];
  var year_to = queryObject.year[1];
  var datetxt, year_select;

  if (year_from == year_to) {
    year_select = (season_select == "Dezember-Februar") ? year_from + "-" + (year_from + 1) : year_from;
  } else {
    year_select = checkYear(year_from, year_to);
  }

  datetxt = infoObject.location_name + ", " + season_select + " " + year_select;

  var speciestxt = infoObject.species_name + infoObject.species_prot + ", ";
  var infotxt = (infoObject.species_prot !== "") ? "<span class='infoTxt'>(Aus Schutzgründen nur begrenzter Zoom möglich)</span>" : "";

  return "<span class='speciesTxt'>"+speciestxt + "<b>"+datetxt+"</b></span>" + infotxt;

};

/* startSearchDB()
 *
 */
function startSearchDB() {

  console.log(queryObject);
  vorkommen.setParams(queryObject);
  brutstatus.setParams(queryObject);
  sightings.setParams(queryObject);

};


/* create Leaflet map object and their controls
 *
 */
var bbox = infoObject.bbox;
var southWest = L.latLng(bbox[3], bbox[2]),
    northEast = L.latLng(bbox[1], bbox[0]);
    district_bounds = L.latLngBounds(southWest, northEast).pad(0.2);

// map object
var map = L.map('map', {
  crs: L.CRS.EPSG3857,
  maxBounds: district_bounds,
  minZoom: 6,
  maxZoom: 11.5, // tk25vrt-level
  zoomSnap: 0.5,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 50,
  // layers: [],
  zoomControl: false,
  attributionControl: false
});

//handling Zoomlevel
if (infoObject.tkmax == "tk50") {
    infoObject.species_prot = " (sensible Art)";
    // restrict zoom to tk50-level
    map.setMaxZoom(7.5);
  } else if (infoObject.tkmax == "tk25") {
    infoObject.species_prot = " (sensible Art)";
    // restrict zoom to tk25-level
    map.setMaxZoom(9.5);
  } else {
    infoObject.species_prot = "";
    // default zoom depending on hmf value
    (infoObject.hmf == 1) ? map.setMaxZoom(14): map.setMaxZoom(11.5);
}

map.fitBounds(district_bounds);
map.setMinZoom(map.getBoundsZoom(district_bounds));
map.doubleClickZoom.disable(); 

/* infoMessage control
*
*/
var infoMessage = L.Control.extend({
  options: {
    position: "topleft"
  },
  onAdd: function() {
    return L.DomUtil.get("infoMsg");
  },
  setContent: function(content) {
    this.getContainer().innerHTML = content;
  },
  // hide: function(){
  //   this.getContainer().style.display='none';
  // }
});
var infoMessage = new infoMessage().addTo(map);

// scale control
// L.control.scale({
//   position: "bottomleft",
//   maxWidth: 200,
//   imperial: false
// }).addTo(map);

/* legend control
*
*/
var legendLink = L.Control.extend({
  options: {
    position: "bottomleft"
  },
  onAdd: function(map) {
    var container = L.DomUtil.create("div", "legend-control");

    var link = L.DomUtil.create("a", "legend-link");
    link.href = "#";
    link.textContent = "Legende schliessen";
    link.title = "Legende";

    var showLegend = true;
    container.onclick = function() {
      if(showLegend === true){
           //$('.leaflet-legend').hide();
           //map.removeControl(mapLegendm);
           document.getElementsByClassName('leaflet-legend')[0].style.display='none';
           this.getElementsByClassName("legend-link")[0].innerHTML="Legende öffnen";
           showLegend = false; 
        }else{
           //$('.leaflet-legend').show();
           //map.addControl(mapLegendm);
           document.getElementsByClassName('leaflet-legend')[0].style.display='inherit';
           this.getElementsByClassName("legend-link")[0].innerHTML="Legende schliessen";
           showLegend = true; 
        }     
    }

    container.appendChild(link);
    return container;
  }
});
map.addControl(new legendLink());


/* zoom control
*
*/
L.control.zoom({
  position: "bottomright"
}).addTo(map);


/* maxZoomButton control
*
*/
var maxZoomButton = L.Control.extend({
  options: {
    position: "bottomright"
  },
  onAdd: function(map) {
    var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-custom-maxzoom");

    var button = L.DomUtil.create("a", "leaflet-control-maxzoom");
    button.href = "#";
    button.title = "Zoom auf Region";

    container.onclick = function() {
        map.fitBounds(district_bounds);
    }

    container.appendChild(button);
    return container;
  }
});
map.addControl(new maxZoomButton());

/* fullscreen control
*
*/
L.control.fullscreen({
  position: 'bottomright', // topleft, topright, bottomright or bottomleft
  title: 'Anzeige im Vollbild',
  titleCancel: 'Vollbild-Modus beenden',
  forceSeparateButton: true,
}).addTo(map);

/* set Leaflet legend panel
 * 225ea8,41b6c4,a1dab4,ffffcc
 */
function getColor_grid(d) {
  return d == "sehr hoch" ? '#3333ff' :
    d == "hoch" ? '#6666ff' :
    d == "mäßig" ? '#9999ff' :
    d == "gering" ? '#ccccff' :
    '#fafafa';
}

function getColor_circ(d) {
  return d == "sicher" ? '#FF0000' :
    d == "wahrscheinlich" ? '#ffa500' :
    d == "möglich" ? '#FFFF00' :
    '#fafafa';
}

function createLegend(div, grades) {
  var tbl = document.createElement("table");
  var tblBody = document.createElement("tbody");
  var entries = Object.entries(grades);

  // cells creation
  for (var i = 0; i < entries.length; i++) {
    // table row creation
    var row = document.createElement("tr");
    switch (div.className) {
      case "leaflet-legend-vorkommen":
        row.innerHTML = '<td><i class="circle fillbrown" style="border:1px solid"></i></td>' +
          '<td>' + entries[i][1] + '</td>';
        break;
      case "leaflet-legend-bzcode":
        row.innerHTML = '<td><i class="circle" style="border:1px solid; background:' + getColor_circ(entries[i][1]) + '"></i></td>' +
          '<td>' + entries[i][1] + '</td>';
        break;
      case "leaflet-legend-beob":
        row.innerHTML = '<td><i style="border:1px solid; background:' + getColor_grid(entries[i][0]) + '"></i></td>' +
          '<td>' + entries[i][0] + '<span class="small">' + entries[i][1] + '</span></td>';
        break;      
      default:
        "";
    }
    tblBody.appendChild(row);
  }

  tbl.appendChild(tblBody);
  div.appendChild(tbl);

  return div;
}

// mapLegend control
var mapLegend = L.Control.extend({
  options: {
    position: "topleft"
  },
  onAdd: function(map) {
    var main_div = L.DomUtil.create("div", "leaflet-legend");

    var div1 = L.DomUtil.create("div", "leaflet-legend-vorkommen"),
      grades1 = {
        1: "Art gemeldet"
      };
    div1.innerHTML = "<strong>Vorkommen</strong><br/>";
    main_div.appendChild(createLegend(div1, grades1));

    var div2 = L.DomUtil.create("div", "leaflet-legend-bzcode"),
      grades2 = {
        1: "unbekannt",
        2: "möglich",
        3: "wahrscheinlich",
        4: "sicher"
      };
    div2.innerHTML = "<strong>Max. Brutstatus</strong><br/>";
    div2.style.display = "none";
    main_div.appendChild(createLegend(div2, grades2));

    var div3 = L.DomUtil.create("div", "leaflet-legend-beob"),
      grades3 = {
        "keine": " (0 Beobachtungen)",
        "gering": " (1-19 Beobachtungen)",
        "mäßig": " (20-99 Beobachtungen)",
        "hoch": " (100-500 Beobachtungen)",
        "sehr hoch": " (>500 Beobachtungen)"
      };
    div3.style.paddingTop = "0.7rem";
    div3.innerHTML = "<strong>Meldeaktivität aller Arten</strong><br/>";
    main_div.appendChild(createLegend(div3, grades3));

    return main_div;
  }
});
map.addControl(new mapLegend());
//var mapLegendm = new mapLegend();