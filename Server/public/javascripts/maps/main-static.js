// London
// var coords = [51.505, -0.09];
// Nitech
var coords = [35.156324, 136.923108];
// var coords = [35.1477396854921, 136.93947315216136];
// var coords = [35.14140576329495, 136.98095083236763];

var world = VIZI.world('world', {
  skybox: true,
  postProcessing: false
}).setView(coords);

// Set position of sun in sky
// world._environment._skybox.setInclination(0.3);
world._environment._skybox.setInclination(0.1);

// obtain camera
var camera = world.getCamera();
// camera.position.set(-150, 75, 125);
camera.position.set(-150, 175, 125);

// Add controls
VIZI.Controls.orbit().addTo(world);

// CartoDB basemap
// VIZI.imageTileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
// }).addTo(world);

// Roads from Mapzen (linestrings)
var roadHighway = {};
var roadKind = {};
var topoJSONRoadLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/roads/{z}/{x}/{y}.topojson?api_key=vector-tiles-NT5Emiw', {
  interactive: false,
  style: function(feature) {
    var width, color;

    if (feature.properties.highway) {
      if (!(feature.properties.highway in roadHighway)) {
        roadHighway[feature.properties.highway] = 0;
      }
      roadHighway[feature.properties.highway]++;
      if (feature.properties.highway == 'major' || feature.properties.highway == 'primary') {
        width = 10;
      } else if (feature.properties.highway == 'secondary') {
        width = 7;
      } else if (feature.properties.highway == 'residental' || feature.properties.highway == 'tertiary') {
        width = 5;
      } else if (feature.properties.highway == 'living_street') {
        width = 3;
      } else if (feature.properties.highway == 'track' || feature.properties.highway == 'trunk') {
        width = 3;
      } else if (feature.properties.highway == 'footway') {
        width = 2;
      } else {
        // console.log(feature.properties.highway);
        width = 1;
      }
    } else {
      width = 1;
    }

    if (feature.properties.kind) {
      if (!(feature.properties.kind in roadKind)) {
        roadKind[feature.properties.kind] = 0;
      }
      roadKind[feature.properties.kind]++;
      if (feature.properties.kind === 'major_road') {
        color = '#f7c616';
      } else if (feature.properties.kind === 'minor_road') {
        color = '#ffffff';
      } else if (feature.properties.kind === 'highway') {
        color = '#888785';
      } else if (feature.properties.kind === 'path') {
        color = '#888785';
      } else if (feature.properties.kind === 'rail') {
        color = '#888785';
      } else {
        color = '#000000';
      }
    }

    if (feature.properties.lanes) {
      console.log(feature);
    }

    if (feature.properties.width) {
      console.log(feature);
    }

    return {
      height: 0,
      color: color,
      opacity: 0.2,
    };
  },
  filter: function(feature) {
    // Don't show points
    if (feature.geometry.type === 'Point') {
      return false;
    }

    // Convert line to polygon
    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {

      var lineWidth = 1.0;

      var coordss = feature.geometry.coordinates;
      if (feature.geometry.type === 'LineString') {
        coordss = [coordss];
      }

      var outCoordss = Simultra.Utils.lineStringsToPolygon(coordss);

      feature.geometry.type = 'MultiPolygon';
      feature.geometry.coordinates = outCoordss;
    }

    return true;
  },
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
}).addTo(world);

// Buildings from Mapzen (polygons)
var topoJSONBuildingLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/buildings/{z}/{x}/{y}.topojson?api_key=vector-tiles-NT5Emiw', {
  interactive: false,
  style: function(feature) {
    var height;

    if (feature.properties.height) {
      height = feature.properties.height;
    } else {
      height = 10 + Math.random() * 10;
    }

    return {
      height: height,
      lineColor: '#f7c616',
      lineWidth: 1,
      lineTransparent: true,
      lineOpacity: 0.2,
      lineBlending: THREE.AdditiveBlending,
      lineRenderOrder: 2
    };
  },
  filter: function(feature) {
    // Don't show points
    return feature.geometry.type !== 'Point';
  },
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
}).addTo(world);

// car layer
var vehicleLayer = VIZI.vehicleLayer({
  'veyron': {
    file: {
      body: '/javascripts/maps/objs/veyron/parts/veyron_body_bin.js',
      wheel: '/javascripts/maps/objs/veyron/parts/veyron_wheel_bin.js'
    },
    textureFile: '/javascripts/maps/objs/veyron/texture.png',
    scale: 0.1,
    translation: {x: 0, y: 0, z: 0},
    rotation: {x: 0, y: 90*Math.PI/180, z: 0}
  }
}, {
  simWidth: 32,
  style: {
    height: 0
  }
}).addTo(world);

// add cars
var veyrons = [];
for (var i = 0; i < 1; i++) {
  veyrons.push(
    // vehicleLayer.addVehicle((i%2==0) ? 'bus' : 'veyron', new VIZI.LatLon(35.157236 + (0.0003*~~(i/10)), 136.924981 + 0.0003*(i%10)), 0.0)
    vehicleLayer.addVehicle('veyron', new VIZI.LatLon(35.157236 + (0.0003*~~(i/10)), 136.924981 + 0.0003*(i%10)), 0.0)
  );
}

// sets the vehicles to move
// vehicleLayer.on('loadCompleted', function() {
//   var vehicles = vehicleLayer._vehicles;
//   var velocities = {};
//   for (var i = 0; i < vehicles.length; i++) {
//     velocities[i] = {vx: 30.0, vy: 0.0, vz: 0.0, wheel: 0.1};
//   }
//   vehicleLayer._setSimVelocities(velocities);
// });