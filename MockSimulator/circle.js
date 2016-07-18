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
  angle: 0.0, // rad
  wheel: 0.1, // rad,
  L: 2.0 // m
};
// var vehicle = {
//   type: 'bus',
//   location: {lat: 35.156324 + offset, lon: 136.923108 + offset},
//   velocity: {vx: 10.0, vy: 0.0, vz: 0.0}, // m/s
//   acceleration: {ax: 0.0, ay: 0.0, az: 0.0},
//   angle: 0, // rad
//   wheel: 0.1, // rad,
//   L: 2.0 // m
// };

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
  // vehicle.velocity += (delta * vehicle.acceleration) * 3600 / 1000;
  vehicle.velocity += delta * vehicle.acceleration;
  var angular_velocity = vehicle.wheel / vehicle.L * vehicle.velocity;
  vehicle.angle += delta * angular_velocity;
  if (vehicle.angle >  Math.PI) { vehicle.angle -= 2.0 * Math.PI; }
  if (vehicle.angle < -Math.PI) { vehicle.angle += 2.0 * Math.PI; }
  var dx = vehicle.velocity * delta * Math.cos(- vehicle.angle);
  var dy = vehicle.velocity * delta * Math.sin(- vehicle.angle);
  vehicle.location.lon += (dx / r_earth) * (180 / Math.PI) / Math.cos(vehicle.location.lat * Math.PI / 180);
  vehicle.location.lat += (dy / r_earth) * (180 / Math.PI);

  // var L = vehicle.L;
  // var location = vehicle.location;
  // var velocity = vehicle.velocity;
  // var acceleration = vehicle.acceleration;
  //
  // var velocityScalar = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy + velocity.vz * velocity.vz);
  // var velocityNorm = {x: velocity.vx / velocityScalar, y: velocity.vy / velocityScalar, z: velocity.vz / velocityScalar};
  // var a = vehicle.wheel / L * velocityScalar * velocityScalar;
  // var centripetalAcceleration = {ax: - a * velocityNorm.z, ay: 0.0, az: a * velocityNorm.x };
  // console.log(centripetalAcceleration);
  //
  // velocity.vx += delta * centripetalAcceleration.ax;
  // velocity.vy += delta * centripetalAcceleration.ay;
  // velocity.vz += delta * centripetalAcceleration.az;
  // var velocityScalar2 = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy + velocity.vz * velocity.vz);
  // velocity.vx *= (velocityScalar / velocityScalar2);
  // velocity.vy *= (velocityScalar / velocityScalar2);
  // velocity.vz *= (velocityScalar / velocityScalar2);
  // console.log(velocity);
  //
  // var angular_velocity = vehicle.wheel / L * velocityScalar;
  // vehicle.angle += delta * angular_velocity;
  // if (vehicle.angle >  Math.PI) vehicle.angle -= 2.*Math.PI;
  // if (vehicle.angle < -Math.PI) vehicle.angle += 2.*Math.PI;
  //
  // var dx = delta * velocity.vx;
  // var dz = delta * velocity.vz;
  // location.lon += (dx / r_earth) * (180 / Math.PI) / Math.cos(location.lat * Math.PI / 180);
  // location.lat += (dz / r_earth) * (180 / Math.PI);
  // console.log(location);

  // update
  request
    .put(baseUrl+'/api/v1/vehicles/'+vehicle.id)
    .send(vehicle)
    .end(function(err, res) {
      vehicle = res.body;
      console.log(vehicle);

      setTimeout(function() {
        updateVehicle()
      }, 10);
    });
}