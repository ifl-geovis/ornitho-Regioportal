//queryObject with default values
var queryObject = {
  "grid": "tk",
  "sid": 0, //species_id
  "lid": 2000, //govlevel_id, 2000 = Germany
  "ts": "SEASON", //time_split
  "tp": [0,0], //time_point, 0 = ganzjährig
  "year": [0,0] //from - to years
};

//infoObject with default values
var infoObject = {
  "species_name": "",
  "species_prot": "", //sensible Art?
  "location_name": "",
  "season_select": "Januar-Dezember", //ganzjährig
  "bbox": [0,0,0,0], //boundingbox location 
  "tkmax": "tk50",
  "hmf": 0 //hmf data available?
};

const seasons = [
  {season: "Frühling", id: 1, text: "März-Mai"},
  {season: "Sommer", id: 2, text: "Juni-August"},
  {season: "Herbst", id: 3, text: "September-November"},
  {season: "Winter", id: 4, text: "Dezember-Februar"}
];

//layersObject, wms parameters for baselayers and overlays
var layersObject = {  
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "&copy; OpenStreetMap contributors"
  },
  mapserver : {
      url: "https://mapserver.ornitho-regioportal.de/mapserv?map=MS_MAPFILE",
      sld: "https://www.ornitho-regioportal.de/sld/",
      name: {
          district: "admin_districts_germany",
          tk50: "grid_tk50",
          tk25: "grid_tk25",
          tk25vrt: "grid_tk25vrt",
          vorkommen: "tk_vorkommen",
          brutstatus: "tk_brutzeitcode",
          sight: "sightings"
      }
  }
};