if (typeof $ === 'undefined') {
  console.error('jQuery not loaded!');
}

// the earth radius
var r_earth = 6378137.0;

/**
 * Simultra
 * @constructor
 */
function Simultra(vehicleLayer) {
  // construct
  this._vehicleLayer = vehicleLayer;
  this._world = null;

  this.vehicles = {};
}

/**
 * Add to the world
 * @param world
 * @returns {Simultra} simultra instance
 */
Simultra.prototype.addTo = function(world) {
  this._world = world;
  this._onAdd(world);
  return this;
};

/**
 * Called when Simultra is added to a world
 * @param world
 * @private
 */
Simultra.prototype._onAdd = function(world) {
  var self = this;

  // // add event listeners
  // world.on('preUpdate', function (delta) {
  //   self.extrapolateVehicles(delta);
  // });

  this.interval = 10;

  // start retrieving data from server
  this.updateVehicles();
};

var hasError = false;

/**
 * Extrapolate and update vehicle locations
 */
Simultra.prototype.extrapolateVehicles = function(delta) {
  if (hasError) return;

  // TODO: run this computation on a different thread / multi-thread using Worker
  try {
    // for each vehicle
    $.each(this.vehicles, function(id, vehicle) {
      // update parameters
      var vehicleData = vehicle.data;
      vehicleData.velocity += (delta * vehicleData.acceleration) * 3600 / 1000;
      vehicleData.angle += delta * vehicleData.angular_velocity;
      while (vehicle.angle > 2*Math.PI) { vehicle.angle -= 2*Math.PI; }
      while (vehicle.angle < 0) { vehicle.angle += 2*Math.PI; }
      var dx = vehicleData.velocity * delta * Math.cos(vehicleData.angle);
      var dy = vehicleData.velocity * delta * Math.sin(vehicleData.angle);
      vehicleData.location.lon += (dx / r_earth) * (180 / Math.PI) / Math.cos(vehicleData.location.lat * Math.PI / 180);
      vehicleData.location.lat += (dy / r_earth) * (180 / Math.PI);

      // update rendering
      var vehicleObject = vehicle.object;
      vehicleObject.setLocation(vehicleData.location.lat, vehicleData.location.lon);
      vehicleObject.setRotation(0, vehicleData.angle, 0);
    });
  } catch (e) {
    hasError = true;
    console.error(e);
  }
};

/**
 * update vehicles
 */
Simultra.prototype.updateVehicles = function() {
  var self = this;

  $.get('/api/v1/vehicles', function(data) {

    var locations = {};
    var velocities = {};
    var accelerations = {};

    // add vehicles to the world
    data.forEach(function(vehicle) {
      // if vehicle does not exist
      if (!(vehicle.id in self.vehicles)) {
        // add to vehicle layer
        var object = self._vehicleLayer.addVehicle(
          vehicle.type,
          new VIZI.LatLon(vehicle.location.lat, vehicle.location.lon),
          vehicle.angle
        );
        // add entry to dictionary
        self.vehicles[vehicle.id] = {
          data: vehicle,
          object: object
        };

        console.log('added vehicle: '+JSON.stringify(vehicle));
      }
      // if exists
      else {
        // update properties
        var vehicleData = self.vehicles[vehicle.id].data;
        Object.keys(vehicle).forEach(function(key) {
          vehicleData[key] = vehicle[key];
        });

        console.log('updated vehicle: '+JSON.stringify(vehicle));
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
      // locations[vehicle.id] = {
      //   lat: vehicle.location.lat, lon: vehicle.location.lon, angle: vehicle.angle
      // };
      // velocities[vehicle.id] = {
      //   vx: vehicle.velocity.vx, vy: vehicle.velocity.vy, vz: vehicle.velocity.vz, wheel: vehicle.wheel
      // };
      // accelerations[vehicle.id] = {
      //   ax: vehicle.acceleration.ax, ay: vehicle.acceleration.ay, az: vehicle.acceleration.az
      // };
    });

    // update simulation parameter
    self._vehicleLayer._setSimLocations(locations);
    self._vehicleLayer._setSimVelocities(velocities);
    self._vehicleLayer._setSimAccelerations(accelerations);

    // continue updating
    setTimeout(function() {
      self.updateVehicles();
    }, self.interval);

  });
};
