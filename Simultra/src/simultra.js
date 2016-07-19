import VIZI from 'vizi';

import API from './io/API';
import Util from './util/index';

const UPDATE_INTERVAL_MS = 1000;

class Simultra {
  constructor(baseUrl, defaultCoords) {
    var coords = defaultCoords || [35.156324, 136.923108];

    this._setupWorld(coords);
    this._setupBasemap();
    this._setupRoads();
    this._setupBuildings();
    this._setupVehicles();

    this._vehicles = [];

    this._api = new API(baseUrl);
    this._isRunning = false;
  }

  _setupWorld(coords) {
    // create a world
    var world = VIZI.world('world', {
      skybox: true,
      postProcessing: false
    }).setView(coords);
    world._environment._skybox.setInclination(0.1);

    // obtain the camera
    var camera = world.getCamera();
    camera.position.set(-150, 175, 125);

    // Add controls
    VIZI.Controls.orbit().addTo(world);

    // set the instance properties
    this._world = world;
  }

  _setupBasemap() {
    // CartoDB basemap
    var basemapLayer = VIZI.imageTileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    }).addTo(this._world);

    // set the instance properties
    this._basemapLayer = basemapLayer;
  }

  _setupRoads() {
    var self = this;

    // Roads from Mapzen
    var topoJSONRoadLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/roads/{z}/{x}/{y}.topojson?api_key=vector-tiles-NT5Emiw', {
      interactive: false,
      style: function(feature) {
        if (feature.properties.lanes) {
          console.log(feature);
        }
        if (feature.properties.width) {
          console.log(feature);
        }

        return Util.HighwayUtils.style(feature, {
          height: 0,
          opacity: 0.2
        });
      },
      filter: function(feature) {
        // Don't show points
        if (feature.geometry.type === 'Point') {
          return false;
        }

        // Convert line to polygon
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
          var lineWidth = Util.HighwayUtils.lineWidth(feature, 1.0);
          var coordss = (feature.geometry.type === 'LineString') ? [feature.geometry.coordinates] : feature.geometry.coordinates;
          var outCoordss = Util.HighwayUtils.lineStringsToPolygon(self._world, coordss, lineWidth);

          feature.geometry.type = 'MultiPolygon';
          feature.geometry.coordinates = outCoordss;
        }

        return true;
      },
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
    }).addTo(this._world);

    // set the instance properties
    this._roadLayer = topoJSONRoadLayer;
  }

  _setupBuildings() {
    // Buildings from Mapzen
    var topoJSONBuildingLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/buildings/{z}/{x}/{y}.topojson?api_key=vector-tiles-NT5Emiw', {
      interactive: false,
      style: function(feature) {
        return Util.BuildingUtils.style(feature, {
          height: 1,
          lineColor: '#f7c616',
          lineWidth: 1,
          lineTransparent: true,
          lineOpacity: 0.2,
          lineBlending: THREE.AdditiveBlending,
          lineRenderOrder: 2
        });
      },
      filter: function(feature) {
        // Don't show points
        return feature.geometry.type !== 'Point';
      },
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
    }).addTo(this._world);

    // set the instance properties
    this._buildingLayer = topoJSONBuildingLayer;
  }

  _setupVehicles() {
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
        rotation: {x: 0, y: 90 * Math.PI / 180, z: 0}
      }
    }, {
      simWidth: 32,
      style: {
        height: 0
      }
    }).addTo(this._world);

    // set the instance properties
    this._vehicleLayer = vehicleLayer;
  }

  /**
   * Sets the center coordinate of the view
   * @param lat latitude
   * @param lon longitude
   */
  setView(lat, lon) {
    this._world.setView([lat, lon]);
  }

  /**
   * Starts updating the view
   */
  start() {
    this._isRunning = true;

    var self = this;
    setTimeout(function() { self._update(); }, 0);
  }

  _update() {
    var self = this;

    if (this._isRunning) {

      this._lastUpdatedAt = Date.now();

      this._api.getVehicles()
        .then(function(data, textStatus, jqXHR) {

          self._performUpdate(data);

        }).fail(function(jqXHR, textStatus, errorThrown) {

          console.error('Error updating the simulation: ' + textStatus + ', ' + JSON.stringify(errorThrown));

        }).always(function() {

          if (self._isRunning) {
            // calculate the delay
            var lastUpdate = self._lastUpdatedAt;
            var now = Date.now();
            var delay = UPDATE_INTERVAL_MS - (now - lastUpdate);

            // register the next update
            setTimeout(function() { self._update(); }, (delay > 0) ? delay : 0);
          }

        });

    }
  }

  _performUpdate(data) {
    var self = this;

    var locations = {};
    var velocities = {};
    var accelerations = {};

    data.forEach(function(vehicle) {
      // if vehicle does not exist
      if (!(vehicle.id in self._vehicles)) {
        // add to vehicle layer
        var object = self._vehicleLayer.addVehicle(
          vehicle.type,
          new VIZI.LatLon(vehicle.location.lat, vehicle.location.lon),
          vehicle.angle
        );
        // add entry to dictionary
        self._vehicles[vehicle.id] = {
          data: vehicle,
          object: object
        };

        console.log('added vehicle: ' + JSON.stringify(vehicle));
      }
      // if exists
      else {
        // update properties
        var vehicleData = self._vehicles[vehicle.id].data;
        Object.keys(vehicle).forEach(function(key) {
          vehicleData[key] = vehicle[key];
        });

        console.log('updated vehicle: ' + JSON.stringify(vehicle));
      }

      // for simulation
      locations[vehicle.id] = {
        lat: vehicle.location.lat, lon: vehicle.location.lon, angle: vehicle.angle
      };
      velocities[vehicle.id] = {
        vx: vehicle.velocity, vy: 0.0, vz: 0.0, wheel: vehicle.wheel
      };
      accelerations[vehicle.id] = {
        ax: vehicle.acceleration, ay: 0.0, az: 0.0
      };
    });

    // update simulation parameters
    this._vehicleLayer._setSimLocations(locations);
    this._vehicleLayer._setSimVelocities(velocities);
    this._vehicleLayer._setSimAccelerations(accelerations);
  }

  /**
   * Stops updating the view
   */
  stop() {
    this._isRunning = false;
  }

  /**
   * Returns if the view updating loop is running
   *
   * @returns {boolean}
   */
  isRunning() {
    return this._isRunning;
  }
}

export default Simultra;
window.Simultra = Simultra;
