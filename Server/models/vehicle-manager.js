var extend = require('extend');

/**
 * VehicleManager class
 * @constructor
 */
function VehicleManager() {
  this.vehicles = [];
}

/**
 * Create a new vehicle
 * @param data
 */
VehicleManager.prototype.createNew = function(data) {
  var _default = {
    id: 0,
    type: 'veyron',
    location: {lat: 35.157236, lon: 136.924981},
    velocity: 0, // [m/s]
    acceleration: 0, // [m/ss]
    angle: 0, // [rad]
    wheel: 0 // [rad/s]
  };
  var vehicle = extend(_default, data);
  vehicle.id = this.vehicles.push(vehicle) - 1;

  return vehicle;
};

/**
 * Return all vehicles
 * @returns {Array}
 */
VehicleManager.prototype.getAll = function() {
  return this.vehicles;
};

/**
 * Return a vehicle
 * @param id
 * @returns {null}
 */
VehicleManager.prototype.get = function(id) {
  return (id in this.vehicles) ? this.vehicles[id] : null;
};

/**
 * Update an existing vehicle
 * @param id
 * @param data
 */
VehicleManager.prototype.update = function(id, data) {
  // if the vehicle exists
  if (id in this.vehicles) {
    // update the properties
    var vehicle = this.vehicles[id];
    Object.keys(data).forEach(function(key) {
      if (key in vehicle) {
        vehicle[key] = data[key];
      }
    });

    return vehicle;
  }
  // if not exists, return error
  else {
    return undefined;
  }
};

// singleton
var vehicleManager = new VehicleManager();

module.exports = vehicleManager;