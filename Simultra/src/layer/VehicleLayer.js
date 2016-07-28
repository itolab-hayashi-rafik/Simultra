import VIZI from 'vizi';
import extend from 'extend';
import operative from 'operative';

import Layer from './Layer';

import API from '../io/API';

import WorkerUtils from '../util/WorkerUtils';

const UPDATE_INTERVAL_MS = 10000;

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

    // start all of the workers
    this._vehicles.forEach((vehicle,id) => {
      if (vehicle.worker) {
        vehicle.worker.start(id, self._createWorkerCallback());
      }
    });

    setTimeout(function() { self._update(); }, 0);
  }

  /**
   * Stops updating the view
   */
  stop() {
    this._isRunning = false;

    // terminate all of the workers
    this._vehicles.forEach(vehicle => {
      if (vehicle.worker) {
        vehicle.worker.stop();
      }
    });
  }

  _update() {
    var self = this;

    if (this._isRunning) {

      this._lastUpdatedAt = Date.now();

      this._api.getVehicles()
        .then(function(data) {

          self._performUpdate(data);

        }).catch(function(err) {

        console.error('Error updating the vehicle layer: ' + err);

      }).then(function() {

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

    // map vehicle parameters into dictionaries
    data.forEach(vehicle => {
      // if vehicle does not exist
      if (!self._hasVehicle(vehicle)) {
        // add to vehicle layer
        self._addVehicle(vehicle);
      }
    });
  }

  _hasVehicle(vehicle) {
    return (vehicle.id in this._vehicles);
  }

  _addVehicle(vehicle) {
    var viziLayer = this._getViziLayer();

    // add vehicle to the vizi layer
    var object = viziLayer.addVehicle(
      vehicle.type,
      new VIZI.LatLon(vehicle.location.lat, vehicle.location.lon),
      vehicle.angle
    );

    // create a new updating thread
    var worker = operative(this._createWorker(), WorkerUtils.getDependencies());

    // add entry to dictionary
    this._vehicles[vehicle.id] = {
      data: vehicle,
      object: object,
      worker: worker
    };

    // start the worker
    worker.start(vehicle.id, this._createWorkerCallback());

    console.log('added vehicle: ' + JSON.stringify(vehicle));
  }

  _createWorker() {
    var baseUrl = this._api.baseUrl;
    return {
      _interval: 10,
      _baseUrl: baseUrl,
      _api: null,
      _id: null,
      _callback: null,
      _isRunning: false,

      /** start updating the vehicle */
      start: function(id, callback) {
        this._api = new SimWorker.API(this._baseUrl);
        this._id = id;
        this._callback = callback;
        this._isRunning = true;

        var self = this;
        setTimeout(function() { self._update(); }, self._interval);
      },

      _update: function() {
        var id = this._id;
        var self = this;
        this._api.getVehicle(id)
          .then(function(data) {
            self._callback(data);
          })
          .catch(function(err) {
            console.error(err);
          })
          .then(function() {
            if (self._isRunning) {
              setTimeout(function() { self._update(); }, self._interval);
            }
          });
      },

      /** stop updating */
      stop: function() {
        this._isRunning = false;
      }
    };
  }

  _createWorkerCallback() {
    return (function(that) {
      return function(vehicle) {
        var viziLayer = that._getViziLayer();

        // update the object in vizi layer
        viziLayer.setLocation(vehicle.id, vehicle.location.lat, vehicle.location.lon, -vehicle.angle);
        viziLayer.setVelocity(vehicle.id, vehicle.velocity, 0, 0, vehicle.wheel);
      };
    })(this);
  }

}

export default VehicleLayer;
