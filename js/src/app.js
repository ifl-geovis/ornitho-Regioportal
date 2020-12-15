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


/* checkDecades()
 * decade_from should always be lower,
 * only a maximum of 9 consecutive decades possible
 *
 */
function checkDecades(decade_from, decade_to) {

  if (decade_from > decade_to) {
    queryObject.tp[1] = decade_from;
    $("#decadeselector_to").val(decade_from).trigger("change");
    infoObject.decade_to = decadeArray[Math.ceil(parseInt(decade_from) / 3) - 1].children.find(x => x.id == parseInt(decade_from)).to;
  }

  if (decade_to - decade_from > 8) {
    queryObject.tp[1] = decade_from + 8;
    $("#decadeselector_to").val(decade_from + 8).trigger("change");
    infoObject.decade_to = decadeArray[Math.ceil(parseInt(decade_from) / 3) + 1].children.find(x => x.id == parseInt(decade_from + 8)).to;
  }

}


/* formatInfoMessage()
 * creates the info content in the top left of the map
 *
 */
function formatInfoMessage() {

  var season_select = infoObject.season_select;
  var decade_from = infoObject.decade_from;
  var decade_to = infoObject.decade_to;
  var year_from = queryObject.year[0];
  var year_to = queryObject.year[1];

  var datetxt, year_select;

  if (queryObject.ts == "SEASON") {

    if (year_from == year_to) {
      year_select = (season_select == "Dezember-Februar") ? year_from + "-" + (year_from + 1) : year_from;
    } else {
      year_select = checkYear(year_from, year_to);
    }
    datetxt = season_select + ", " + year_select;

  } else if (queryObject.ts == "DECADE") {

    var fields = decade_to.split('.');
    // get the last day of the month
    var decade_to = (fields[0] == "xx") ? decade_to.replace("xx", new Date(year_from, parseInt(fields[1]), 0).getDate()) : decade_to;

    if (year_from == year_to) {
      year_select = year_from;
    } else {
      year_select = checkYear(year_from, year_to);
    }
    datetxt = decade_from + " - " + decade_to + " (" + year_select + ")";
  }

  var speciestxt = (birdlayerConf.id != "NON") ? infoObject.species_name + infoObject.species_prot + ", " : "";
  var infotxt = (infoObject.species_prot !== "" && birdlayerConf.id != "NON") ? "<span class='infoTxt'>(Aus Schutzgründen nur begrenzter Zoom möglich)</span>" : "";

  return speciestxt + datetxt + infotxt;

};


/* startSearchDB()
 *
 */
function startSearchDB() {

  //console.log(queryObject);
  infoMessage.setContent(formatInfoMessage());
  birddata.setParams(queryObject);
  sightings.setParams(queryObject);

};


/* detect state of readiness -
 * this code will only run once the DOM is ready
 *
 */
$(document).ready(function() {

  // activate tooltip on the button group
  $('[data-toggle="tooltip"]').tooltip();

  // load imprint content to Modal
  $("#imprint").load("components/impr.html");
  $("#privacy").load("components/datap.html");

  // handling collapsed navbar when resize
  $(window).resize(function() {
    if ($(window).width() > 992) {
      $("#navbarCollapse").collapse("hide");
    } else {
      if ($("#divseparator").hasClass("showing_f")) {
        $("#map").css("marginTop", "9.4rem");
        $("#map").css("min-height", "calc(100vh - 10.4rem)");
      }
    };
  });

  // buttongroup seasonselector change event
  $("#seasonselector input").on("change", function() {
    if (this.id != "5") {
      if ($("#divseparator").hasClass("showing_f")) {
        $("#divseparator").removeClass("showing_f").addClass("hiding");
        $("#decadeselector").removeClass("showing_f").addClass("hiding");
        $("#map").css("marginTop", "9.4rem");
        $("#map").css("min-height", "calc(100vh - 10.4rem)");
      }
      queryObject.ts = "SEASON";
      queryObject.tp = Array.from([this.id, this.id], Number);
      infoObject.season_select = this.parentElement.dataset.originalTitle;
    } else {
      $("#divseparator").removeClass("hiding").addClass("showing_f");
      $("#decadeselector").removeClass("hiding").addClass("showing_f");
      if ($(window).width() > 992) {
        $("#map").css("marginTop", "11.6rem");
        $("#map").css("min-height", "calc(100vh - 12.6rem)");
      }
      queryObject.ts = "DECADE";
      queryObject.tp = Array.from([1, 1], Number);
    }
  });

  // decadeselector object
  $("#decadeselector_from").select2({
    width: "14.8rem",
    dropdownCssClass: "mediumdrop",
    data: decadeArray
  });

  $("#decadeselector_from").on("select2:select", function(evt) {
    queryObject.tp[0] = evt.params.data.id;
    infoObject.decade_from = evt.params.data.from;
    checkDecades(queryObject.tp[0], queryObject.tp[1]);
  });

  $("#decadeselector_to").select2({
    width: "14.8rem",
    dropdownCssClass: "mediumdrop",
    data: decadeArray
  });

  $("#decadeselector_to").on("select2:select", function(evt) {
    queryObject.tp[1] = evt.params.data.id;
    infoObject.decade_to = evt.params.data.to;
    checkDecades(queryObject.tp[0], queryObject.tp[1]);
  });

  // yearselector object
  $("#yearselector_from").select2({
    width: "8.6rem",
    dropdownCssClass: "smalldrop",
    data: yearArray
  });

  $("#yearselector_from").on("select2:select", function(evt) {
    queryObject.year[0] = parseInt(evt.params.data.id);
  });

  $("#yearselector_to").select2({
    width: "8.6rem",
    dropdownCssClass: "smalldrop",
    data: yearArray
  });

  $("#yearselector_to").on("select2:select", function(evt) {
    queryObject.year[1] = parseInt(evt.params.data.id);
  });

  // preset yearselector (last 5 years)
  $("#yearselector_from").val(queryObject.year[0]).trigger("change");
  $("#yearselector_to").val(queryObject.year[1]).trigger("change");

  // submit button to call startSearchDB()
  $("#submit").click(function() {
    startSearchDB();
  });

  /* loading species data depending on login (user rights)
   * searchpriv = 1, extended list will be loaded
   *
   */
  $.ajax({
    url: "php/getNavbarData.php",
    type: "GET",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    data: {
      id: "species",
      pm: searchpriv
    },
  }).done(function(response) {
    var speciesData = $.parseJSON(response).results;
    // species-search input
    $("#species-search-input").prepend("<option selected></option>").select2({
      width: "40%",
      placeholder: "Artname",
      allowClear: true,
      selectOnClose: false,
      tokenSeparators: [',', ' '],
      data: speciesData
    });

    // pre-select species of the Month
    $("#species-search-input").val(sid).trigger("change");
    $("#species-search-input").trigger({
      type: "select2:select",
      params: {
        data: speciesData.find(x => x.id == parseInt(sid))
      }
    });

  });

  $("#species-search-input").on("select2:select", function(evt) {
    queryObject.sid = parseInt(evt.params.data.id);
    infoObject.species_name = evt.params.data.text;

    if (evt.params.data.pm == "50") {
      infoObject.species_prot = " (sensible Art)";
      // restrict zoom to tk50-level
      map.setMaxZoom(7.5);
    } else if (evt.params.data.pm == "25") {
      infoObject.species_prot = " (sensible Art)";
      // restrict zoom to tk25-level
      map.setMaxZoom(9.5);
    } else {
      infoObject.species_prot = "";
      // default zoom depending on hmf value
      (infoObject.hmf == 1) ? map.setMaxZoom(14): map.setMaxZoom(11.5);
    }

    startSearchDB();

    if (!map.hasLayer(birddata)) {
      $("#layer-input").val("VOR").trigger("change");
      setBirdLayers("VOR");
    }
  });

  $("#species-search-input").on("select2:unselecting", function(e) {
    queryObject.sid = 0;
    infoObject.species_prot = "";
    (infoObject.hmf == 1) ? map.setMaxZoom(14): map.setMaxZoom(11.5);
    $("#layer-input").val("NON").trigger("change");
    setBirdLayers("NON");
  });

  /* dynamically loading places when min of 3 characters are set
   *
   */
  $("#places-search-input").prepend("<option selected></option>").select2({
    width: "40%",
    placeholder: "Ort",
    allowClear: true,
    selectOnClose: false,
    minimumInputLength: 3,
    ajax: {
      url: "php/getNavbarData.php",
      type: "GET",
      contentType: "application/json; charset=utf-8",
      delay: 250,
      quietMillis: 100,
      data: function(params) {
        return {
          id: "location",
          qstr: params.term // search term
        };
      },
      processResults: function(response) {
        return ($.parseJSON(response).results != null) ? {
          results: $.parseJSON(response).results
        } : {
          results: [{
            id: 0,
            text: ""
          }]
        };
      },
      cache: true
    }
  });

  $("#places-search-input").on("select2:select", function(evt) {
    queryObject.lid = evt.params.data.id;
    if (queryObject.lid != 0) {
      district.setParams({
        "lid": queryObject.lid
      });

      var grid = queryObject.grid;
      var bbox = evt.params.data.value;
      var southWest = L.latLng(bbox[3], bbox[2]),
        northEast = L.latLng(bbox[1], bbox[0]);
      district_bounds = L.latLngBounds(southWest, northEast);

      if (infoObject.species_prot === "") {
        if (evt.params.data.hmf == "1") {
          infoObject.hmf = 1;
          // zoom to tk25hmf-level possible
          maxzoom = 14;
        } else {
          infoObject.hmf = 0;
          // default zoom to tk25vrt-level
          maxzoom = 11.5;
        }
      } else {
        infoObject.hmf = evt.params.data.hmf;
        // value depending on species protective status
        maxzoom = map.getMaxZoom();
      }

      // wait for fitbounds - zoomend
      (async () => {
        map.fitBounds(district_bounds, {
          padding: [50, 50],
          maxZoom: maxzoom
        });
        await delay(1000);
        if (infoObject.grid_start == queryObject.grid) {
          startSearchDB();
        }
        map.setMaxZoom(maxzoom);
      })();
    }
  });

  $("#places-search-input").on("select2:unselecting", function(e) {
    queryObject.lid = 2000;
    infoObject.hmf = 0;
    if (infoObject.species_prot === "") {
      // default zoom to tk25vrt-level
      map.setMaxZoom(11.5);
    }
    // clear district border
    district.setParams({
      "lid": 0
    });
    // restart search with full extent germany (lid=2000)
    startSearchDB();
  });

  // layer selector for birddata
  $("#layer-input").select2({
    width: "18%",
    minimumResultsForSearch: -1
  });
  $("#layer-input").val("VOR").trigger("change");

  $("#layer-input").on("select2:select", function(evt) {
    setBirdLayers(evt.params.data.id);
  });

}); /* end Document ready */


/* create Leaflet map object and their controls
 *
 */
var southWest = L.latLng(46.3024876979, 4.98865807458),
  northEast = L.latLng(55.983104153, 16.0169958839),
  bld_bounds = L.latLngBounds(southWest, northEast);
var district_bounds;

// map object
var map = L.map('map', {
  center: [51.16338, 10.44768],
  crs: L.CRS.EPSG3857,
  maxBounds: bld_bounds,
  minZoom: 6,
  maxZoom: 11.5, // tk25vrt-level
  zoomSnap: 0.5,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 50,
  // layers: [],
  zoomControl: false,
  attributionControl: false
});

map.fitBounds(bld_bounds);
// map.doubleClickZoom.disable();
map.setMinZoom(map.getBoundsZoom(bld_bounds));


// infoMessage control
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


// imprintLink control
var imprintLink = L.Control.extend({
  options: {
    position: "bottomleft"
  },
  onAdd: function(map) {
    var container = L.DomUtil.create("div", "leaflet-imprint leaflet-control");

    var link = L.DomUtil.create("a");
    link.href = "#";
    link.textContent = "Impressum & Datenschutzerklärung";
    link.title = "Impressum & Datenschutzerklärung";

    container.onclick = function() {
      $("#info_Modal").modal("show");
    }

    container.appendChild(link);
    return container;
  }
});
map.addControl(new imprintLink());


// attribution control
var attribution = new L.Control.Attribution({
  prefix: "",
  position: "bottomleft"
});
map.addControl(attribution);


// zoom control
L.control.zoom({
  position: "bottomright"
}).addTo(map);


// maxZoomButton control
var maxZoomButton = L.Control.extend({
  options: {
    position: "bottomright"
  },
  onAdd: function(map) {
    var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");

    var button = L.DomUtil.create("a", "icon-globe leaflet-control-zoom-max");
    button.href = "#";
    button.title = "Zoom auf Auswahl";

    container.onclick = function() {
      if (queryObject.lid == 2000) {
        map.setZoom(map.getBoundsZoom(bld_bounds));
      } else {
        map.fitBounds(district_bounds);
      }
    }

    container.appendChild(button);
    return container;
  }
});
map.addControl(new maxZoomButton());


// mapCoordinates control
var mapCoordinates = L.Control.extend({
  options: {
    position: "bottomleft"
  },
  onAdd: function(map) {
    return L.DomUtil.create("div", "leaflet-coordinates");
  },
  onRemove: function(map) {
    // Nothing to do here
  },
  setContent: function(content) {
    this.getContainer().innerHTML = content;
  }
});
var mapCoordinates = new mapCoordinates().addTo(map);

var latlng;
map.on("mousemove", function(ev) {
  latlng = "Lat: " + Math.round(ev.latlng.lat * 1000) / 1000 + ", Lon: " + Math.round(ev.latlng.lng * 1000) / 1000;
  mapCoordinates.setContent(latlng);
});
map.on("mouseout", function(ev) {
  //mapCoordinates.setContent('');
});


// scale control
L.control.scale({
  position: "bottomleft",
  maxWidth: 200,
  imperial: false
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
      case "leaflet-legend-spa":
        row.innerHTML = '<td><i class="fillgreen" style="border:1px solid"></i></td>' +
          '<td>' + entries[i][1] + '</td>';
        break;
      case "leaflet-legend-temp":
        row.innerHTML = '<td><img src=' + entries[i][1] + '></td>';
        break;
      case "leaflet-legend-prec":
        row.innerHTML = '<td><img src=' + entries[i][1] + '></td>';
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

    var div4 = L.DomUtil.create("div", "leaflet-legend-spa"),
      grades4 = {
        1: "Vogelschutzgebiete"
      };
    div4.style.paddingTop = "0.7rem";
    div4.innerHTML = "<strong>Natura2000-Gebiete</strong><br/>";
    div4.style.display = "none";
    main_div.appendChild(createLegend(div4, grades4));

    var div5 = L.DomUtil.create("div", "leaflet-legend-temp"),
      grades5 = {
        1: "../img/dwd_temp.png"
      };
    div5.style.paddingTop = "0.7rem";
    div5.innerHTML = "<strong>mttl. Lufttemperatur (1990-2020)</strong><br/>";
    div5.style.display = "none";
    main_div.appendChild(createLegend(div5, grades5));

    var div6 = L.DomUtil.create("div", "leaflet-legend-prec"),
      grades6 = {
        1: "../img/dwd_prec.png"
      };
    div6.style.paddingTop = "0.7rem";
    div6.innerHTML = "<strong>mttl. Niederschlag (1990-2020)</strong><br/>";
    div6.style.display = "none";
    main_div.appendChild(createLegend(div6, grades6));

    return main_div;
  }
});
map.addControl(new mapLegend());


// hide the loading symbol
$(document).one("ajaxStop", function() {
  $("#loader").hide();
});
