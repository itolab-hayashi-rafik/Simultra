/* websocket simulator */
var request = require('superagent');

var baseUrl = 'http://localhost:3000';

// ------------------------------------------------------------
// API
// ------------------------------------------------------------
function newVehicle(vehicle, callback) {
  // create
  console.log('creating');
  request
    .post(baseUrl+'/api/v1/vehicles/new')
    .send(vehicle)
    .end(function(err, res) {
      console.log('created');
      setTimeout(function() {
        callback(res.body);
      }, 0);
    });
}

function updateVehicle(callback) {
  // put request
  request
    .put(baseUrl+'/api/v1/vehicles/'+vehicle.id)
    .send(vehicle)
    .end(function(err, res) {
      setTimeout(function() {
        callback(res.body);
      }, 0);
    });
}
// ------------------------------------------------------------

module.exports = {
  newVehicle: newVehicle,
  updateVehicle: updateVehicle
};