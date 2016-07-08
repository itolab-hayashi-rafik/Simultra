/**
 * Random walk simulator
 */
var request = require('superagent');

var baseUrl = 'http://localhost:3000';
var offset = 0.0001;
var r_earth = 6378137.0;

// data to send
var vehicle = {
  type: 'veyron',
  location: {lat: 35.156324 + offset, lon: 136.923108 + offset},
  velocity: 30, // km/h
  acceleration: 0, // m/ss
  angle: 0, // rad
  angular_velocity: 15 * (Math.PI / 180) // rad/s
};

// create
console.log('creating');
request
  .post(baseUrl+'/api/v1/vehicles/new')
  .send(vehicle)
  .end(function(err, res) {
    console.log('created');
    vehicle = res.body;
    console.log(vehicle);

    updateVehicle();
  });

// update function
var referenceTime = 0;
function updateVehicle() {
  // compute delta time
  var now = Date.now();
  var delta = (referenceTime > 0) ? (now - referenceTime) / 1000 : 0.0;
  referenceTime = now;

  // calculate the vehicle's location
  vehicle.velocity += (delta * vehicle.acceleration) * 3600 / 1000;
  vehicle.angle += delta * vehicle.angular_velocity;
  while (vehicle.angle > 2*Math.PI) { vehicle.angle -= 2*Math.PI; }
  while (vehicle.angle < 0) { vehicle.angle += 2*Math.PI; }
  var dx = vehicle.velocity * delta * Math.cos(vehicle.angle);
  var dy = vehicle.velocity * delta * Math.sin(vehicle.angle);
  vehicle.location.lon += (dx / r_earth) * (180 / Math.PI) / Math.cos(vehicle.location.lat * Math.PI / 180);
  vehicle.location.lat += (dy / r_earth) * (180 / Math.PI);

  // update
  request
    .put(baseUrl+'/api/v1/vehicles/'+vehicle.id)
    .send(vehicle)
    .end(function(err, res) {
      vehicle = res.body;
      console.log(vehicle);

      setTimeout(function() {
        updateVehicle()
      }, 100);
    });
}