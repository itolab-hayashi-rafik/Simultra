import VIZI from 'vizi';
import extend from 'extend';

import Layer from './Layer';

import API from '../io/API';

const UPDATE_INTERVAL_MS = 1000;

class VehicleLayer extends Layer {
  constructor(options) {
    var defaultOptions = {};

    var _options = extend({}, defaultOptions, options);
    super(_options);

    this._vehicles = [];

    this._setup();
  }

  _setup() {

    // car layer
    var viziLayer = VIZI.vehicleLayer({
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
    });

    // set the instance property
    this._setViziLayer(viziLayer);

  }

  /**
   * Starts updating the view
   */
  start() {
    this._isRunning = true;

    var self = this;
    setTimeout(function() { self._update(); }, 0);
  }

  /**
   * Stops updating the view
   */
  stop() {
    this._isRunning = false;
  }

  _update() {
    var self = this;

    if (this._isRunning) {

      this._lastUpdatedAt = Date.now();

      this._api.getVehicles()
        .then(function(data, textStatus, jqXHR) {

          self._performUpdate(data);

        }).fail(function(jqXHR, textStatus, errorThrown) {

        console.error('Error updating the vehicle layer: ' + textStatus + ', ' + JSON.stringify(errorThrown));

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

    // dictionaries to hold parameters
    var locations = {};
    var velocities = {};
    var accelerations = {};

    // map vehicle parameters into dictionaries
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
    var viziLayer = this._getViziLayer();
    viziLayer._setSimLocations(locations);
    viziLayer._setSimVelocities(velocities);
    viziLayer._setSimAccelerations(accelerations);
  }

}

export default VehicleLayer;
