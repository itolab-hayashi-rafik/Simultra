import VIZI from 'vizi';
import extend from 'extend';

import Layer from './Layer';

import API from '../io/API';

const UPDATE_INTERVAL_MS = 1000;

class PedestrianLayer extends Layer {
  constructor(options) {
    var defaultOptions = {};

    var _options = extend({}, defaultOptions, options);
    super(_options);

    this._pedestrians = [];

    this._setup();
  }

  _setup() {

    // pedestrian layer
    var viziLayer = VIZI.pedestrianLayer({
      'monkey': {
        file: {
          body: '/javascripts/maps/json/monkey/monkey.json',
        },
        scale: 1.0,
        translation: {x: 0, y: 0, z: 0},
        rotation: {x: 0, y: 0, z: 0}
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

      this._api.getPedestrians()
        .then(function(data, textStatus, jqXHR) {

          self._performUpdate(data);

        }).fail(function(jqXHR, textStatus, errorThrown) {

        console.error('Error updating the pedestrian layer: ' + textStatus + ', ' + JSON.stringify(errorThrown));

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
    var viziLayer = this._getViziLayer();

    // dictionaries to hold parameters
    var locations = {};
    var velocities = {};
    var accelerations = {};

    // map pedestrian parameters into dictionaries
    data.forEach(function(pedestrian) {
      // if pedestrian does not exist
      if (!(pedestrian.id in self._pedestrians)) {
        // add to pedestrian layer
        var object = viziLayer.addPedestrian(
          pedestrian.type,
          new VIZI.LatLon(pedestrian.location.lat, pedestrian.location.lon),
          pedestrian.angle
        );
        // add entry to dictionary
        self._pedestrians[pedestrian.id] = {
          data: pedestrian,
          object: object
        };

        console.log('added pedestrian: ' + JSON.stringify(pedestrian));
      }
      // if exists
      else {
        // update properties
        var pedestrianData = self._pedestrians[pedestrian.id].data;
        Object.keys(pedestrian).forEach(function(key) {
          pedestrianData[key] = pedestrian[key];
        });

        console.log('updated pedestrian: ' + JSON.stringify(pedestrian));
      }

      // for simulation
      locations[pedestrian.id] = {
        lat: pedestrian.location.lat, lon: pedestrian.location.lon, angle: pedestrian.angle
      };
      velocities[pedestrian.id] = {
        vx: pedestrian.velocity, vy: 0.0, vz: 0.0, wheel: pedestrian.wheel
      };
      accelerations[pedestrian.id] = {
        ax: pedestrian.acceleration, ay: 0.0, az: 0.0
      };
    });

    // update simulation parameters
    viziLayer._setSimLocations(locations);
    viziLayer._setSimVelocities(velocities);
    viziLayer._setSimAccelerations(accelerations);
  }

}

export default PedestrianLayer;
