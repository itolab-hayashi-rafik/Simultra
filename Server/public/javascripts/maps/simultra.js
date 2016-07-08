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

  // add event listeners
  world.on('preUpdate', function (delta) {
    self.interpolateVehicles(delta);
  });

  // start retrieving data from server
  this.updateVehicles();
};

var hasError = false;

/**
 * Interpolate and update vehicle locations
 */
Simultra.prototype.interpolateVehicles = function(delta) {
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

    // add vehicles to the world
    data.forEach(function(vehicle) {
      // if vehicle does not exist
      if (!(vehicle.id in self.vehicles)) {
        // add to vehicle layer
        var object = self._vehicleLayer.addVehicle(
          vehicle.type,
          new VIZI.LatLon(vehicle.location.lat, vehicle.location.lon)
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
    });

    // continue updating
    setTimeout(function() {
      self.updateVehicles();
    }, 10000);

  });
};
