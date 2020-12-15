//queryObject with default values
var queryObject = {
  "grid": "tk50",
  "sid": 0, //species_id
  "lid": 2000, //govlevel_id, 2000 = Germany
  "ts": "SEASON", //time_split
  "tp": [0,0], //time_point, 0 = ganzjährig
  "year": [new Date().getFullYear()-5,new Date().getFullYear()] //last 5 years
};

//infoObject with default values
var infoObject = {
  "species_name": "",
  "species_prot": "", //sensible Art?
  "season_select": "Januar-Dezember",
  "decade_from": "01.01.",
  "decade_to": "10.01.",
  "hmf": 0, //hmf data available?
  "grid_start": "tk50" //default grid tk50
};

//decadeArray with default decades from 1-36
const decadeArray = [
    {
    "text": "Januar",
    "children": [
      {"id": 1, "text": "Jan-1", "from": "01.01.", "to": "10.01."},
      {"id": 2, "text": "Jan-2", "from": "11.01.", "to": "20.01."},
      {"id": 3, "text": "Jan-3", "from": "21.01.", "to": "xx.01."}
    ]},{
    "text": "Februar",
    "children": [
      {"id": 4, "text": "Feb-1", "from": "01.02.", "to": "10.02."},
      {"id": 5, "text": "Feb-2", "from": "11.02.", "to": "20.02."},
      {"id": 6, "text": "Feb-3", "from": "21.02.", "to": "xx.02."}
    ]},{
    "text": "März",
    "children": [
      {"id": 7, "text": "Mar-1", "from": "01.03.", "to": "10.03."},
      {"id": 8, "text": "Mar-2", "from": "11.03.", "to": "20.03."},
      {"id": 9, "text": "Mar-3", "from": "21.03.", "to": "xx.03."}
    ]},{
    "text": "April",
    "children": [
      {"id": 10, "text": "Apr-1", "from": "01.04.", "to": "10.04."},
      {"id": 11, "text": "Apr-2", "from": "11.04.", "to": "20.04."},
      {"id": 12, "text": "Apr-3", "from": "21.04.", "to": "xx.04."}
    ]},{
    "text": "Mai",
    "children": [
      {"id": 13, "text": "Mai-1", "from": "01.05.", "to": "10.05."},
      {"id": 14, "text": "Mai-2", "from": "11.05.", "to": "20.05."},
      {"id": 15, "text": "Mai-3", "from": "21.05.", "to": "xx.05."}
    ]},{
    "text": "Juni",
    "children": [
      {"id": 16, "text": "Jun-1", "from": "01.06.", "to": "10.06."},
      {"id": 17, "text": "Jun-2", "from": "11.06.", "to": "20.06."},
      {"id": 18, "text": "Jun-3", "from": "21.06.", "to": "xx.06."}
    ]},{
    "text": "Juli",
    "children": [
      {"id": 19, "text": "Jul-1", "from": "01.07.", "to": "10.07."},
      {"id": 20, "text": "Jul-2", "from": "11.07.", "to": "20.07."},
      {"id": 21, "text": "Jul-3", "from": "21.07.", "to": "xx.07."}
    ]},{
    "text": "August",
    "children": [
      {"id": 22, "text": "Aug-1", "from": "01.08.", "to": "10.08."},
      {"id": 23, "text": "Aug-2", "from": "11.08.", "to": "20.08."},
      {"id": 24, "text": "Aug-3", "from": "21.08.", "to": "xx.08."}
    ]},{
    "text": "September",
    "children": [
      {"id": 25, "text": "Sep-1", "from": "01.09.", "to": "10.09."},
      {"id": 26, "text": "Sep-2", "from": "11.09.", "to": "20.09."},
      {"id": 27, "text": "Sep-3", "from": "21.09.", "to": "xx.09."}
    ]},{
    "text": "Oktober",
    "children": [
      {"id": 28, "text": "Okt-1", "from": "01.10.", "to": "10.10."},
      {"id": 29, "text": "Okt-2", "from": "11.10.", "to": "20.10."},
      {"id": 30, "text": "Okt-3", "from": "21.10.", "to": "xx.10."}
    ]},{
    "text": "November",
    "children": [
      {"id": 31, "text": "Nov-1", "from": "01.11.", "to": "10.11."},
      {"id": 32, "text": "Nov-2", "from": "11.11.", "to": "20.11."},
      {"id": 33, "text": "Nov-3", "from": "21.11.", "to": "xx.11."}
    ]},{
    "text": "Dezember",
    "children": [
      {"id": 34, "text": "Dez-1", "from": "01.12.", "to": "10.12."},
      {"id": 35, "text": "Dez-2", "from": "11.12.", "to": "20.12."},
      {"id": 36, "text": "Dez-3", "from": "21.12.", "to": "xx.12."}
    ]}
];

//yearArray with selectable years from 2011
var keys = ["id", "text"];
var values = [];
var fromyear = 2011;
var year = new Date().getFullYear();
do {
   values.push([year, year.toString()]);
   year--;
} while (fromyear <= year);
const yearArray = values.map(function(value_set){
      var obj = {};
      for(i = 0; i < keys.length; i++ )
            obj[keys[i]]=value_set[i];
      return obj;
});

//speciesArray with the species of the month
const speciesArray = [
  [71,140,515], //Jan
  [53,72,270],
  [82,190,335],
  [209,284,311], //Apr
  [228,428,389],
  [224,293,421],
  [290,419,378], //Jul
  [249,527,426],
  [77,275,508],
  [9,188,365], //Okt
  [61,115,379],
  [52,520,384]
];
//create random species_id (sid)
var sarray = speciesArray[new Date().getMonth()];
var sid = sarray[Math.floor(Math.random() * sarray.length)];

//layersObject, wms parameters for baselayers and overlays
var layersObject = {
  bkg: {
    url: {
      webatlas: "https://sgx.geodatenzentrum.de/wms_webatlasde.light_grau",
      relief: "https://sgx.geodatenzentrum.de/wms_dgm200",
      vg250: "https://sgx.geodatenzentrum.de/wms_vg250",
      dlm250: "https://sgx.geodatenzentrum.de/wms_dlm250_inspire"
    },
    name: {
      webatlas: "webatlasde.light_grau",
      relief: "relief",
      sta: "vg250_sta",
      lan: "vg250_lan",
      krs: "vg250_krs",
      gem: "vg250_gem",
      hyd: "HY.PhysicalWaters.Waterbodies.Watercourse,HY.PhysicalWaters.Waterbodies.StandingWater"
    },
    format: "image/png32",
    attr: "&copy; GeoBasis-DE / BKG"
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "&copy; OpenStreetMap contributors"
  },
  esri: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "Sources: Esri, DigitalGlobe, GeoEye, and the GIS User Community"
  },
  dlr: {
    url: "https://geoservice.dlr.de/eoc/land/wms",
    name: "LCC_DE_2015",
    attr: "&copy; DLR / EOC"
  },
  dwd: {
    url: "https://cdc.dwd.de/geoserver/CDC/wms",
    name: {
      temp: "GRD_DEU_P30Y_TM_P1Y",
      prec: "GRD_DEU_P30Y_RR_P1Y"
    },
    attr: "&copy; Deutscher Wetterdienst / DWD"
  },
  mapserver : {
      url: "https://mapserver.ornitho-regioportal.de/mapserv?map=MS_MAPFILE",
      sld: "https://www.ornitho-regioportal.de/sld/",
      name: {
          district: "admin_districts_germany",
          natura2000: "natura_2000",
          tk50: "grid_tk50",
          tk25: "grid_tk25",
          tk25vrt: "grid_tk25vrt",
          birdd: "birddata",
          sight: "sightings"
      },
      natura2000: {
        attr: "&copy; European Environment Agency, 2018 (EEA)"
      }
  }
};
