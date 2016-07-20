var extend = require('extend');

/**
 * PedestrianManager class
 * @constructor
 */
function PedestrianManager() {
  this.pedestrians = [];
}

/**
 * Create a new vehicle
 * @param data
 */
PedestrianManager.prototype.createNew = function(data) {
  var _default = {
    id: 0,
    type: 'monkey',
    location: {lat: 35.157236, lon: 136.924981},
    velocity: 0, // [m/s]
    acceleration: 0, // [m/ss]
    angle: 0, // [rad]
    wheel: 0 // [rad/s]
  };
  var pedestrian = extend(_default, data);
  pedestrian.id = this.pedestrians.push(pedestrian) - 1;

  return pedestrian;
};

/**
 * Return all vehicles
 * @returns {Array}
 */
PedestrianManager.prototype.getAll = function() {
  return this.pedestrians;
};

/**
 * Return a vehicle
 * @param id
 * @returns {null}
 */
PedestrianManager.prototype.get = function(id) {
  return (id in this.pedestrians) ? this.pedestrians[id] : null;
};

/**
 * Update an existing vehicle
 * @param id
 * @param data
 */
PedestrianManager.prototype.update = function(id, data) {
  // if the vehicle exists
  if (id in this.pedestrians) {
    // update the properties
    var pedestrian = this.pedestrians[id];
    Object.keys(data).forEach(function(key) {
      if (key in pedestrian) {
        pedestrian[key] = data[key];
      }
    });

    return pedestrian;
  }
  // if not exists, return error
  else {
    return undefined;
  }
};

// singleton
var pedestrianManager = new PedestrianManager();

module.exports = pedestrianManager;