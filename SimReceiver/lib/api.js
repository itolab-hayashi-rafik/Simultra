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
      if (err) {
        console.error(err);
      } else {
        console.log('created');
        setTimeout(function() {
          if (!('body' in res)) {
            console.error('Cannot be created');
          }
          callback('body' in res ? res.body : null);
        }, 0);
      }
    });
}

function deleteVehicle(id, callback) {
  // delete
  console.log('deleting');
  request
    .delete(baseUrl+'/api/v1/vehicles/' + id)
    .end(function(err, res) {
      if (err) {
        console.error(err);
      } else {
        console.log('deleted');
        setTimeout(function() {
          if (!('body' in res)) {
            console.error('Cannot be deleted');
          }
          callback('body' in res ? res.body : null);
        }, 0);
      }
    });
}
// ------------------------------------------------------------

module.exports = {
  newVehicle: newVehicle,
  deleteVehicle: deleteVehicle
};