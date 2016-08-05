/* websocket simulator */
var request = require('superagent');
var WebSocketClient = require('websocket').client;
var Sim = require('./sim');
var Utils = require('./utils');

var baseUrl = 'http://localhost:3000';
var wsBaseUrl = 'ws://localhost:3000';

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

// main function
function main() {
  // obtain ip address
  var ipAddrs = Utils.getLocalAddress();
  var ip = ipAddrs.ipv4.length > 0 ? ipAddrs.ipv4[0].address : null;
  var id = ip ? ip : "unknown";

  // initialize sim
  var sim = new Sim('./highway/4d-nodes.json', './highway/4d-edges.json');

  // initialize the vehicle
  newVehicle(sim.getVehicle(), function(vehicle) {
    sim.setVehicle(vehicle);

    // create a websocket client
    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
      console.log('WebSocket Client Connected');

      connection.on('message', function(msg) {
        if (msg.type === 'utf8') {
          var data = JSON.parse(msg.utf8Data);
          console.log(data);
        } else if (msg.type === 'binary') {
          var data = msg.binaryData;
          // console.log(data);
        } else {
          console.log('Unknown message type!');
          console.log('typeof msg = '+(typeof msg));
          console.log('Object.keys(msg) = '+(Object.keys(msg)));
        }
      });

      function send(data) {
        if (connection.connected) {
          connection.send(JSON.stringify(data));
        }
      }

      var referenceTime = 0;
      // update loop
      function loop() {

        // ------------------------
        // compute delta time
        var now = Date.now();
        var delta = (referenceTime > 0) ? (now - referenceTime) / 1000 : 0.0;
        referenceTime = now;

        // ------------------------
        // update the vehicle
        sim.update(delta);

        // ------------------------
        // send
        send(sim.getVehicle());

      }
      setInterval(function(){ loop(); }, 100);

    });

    // connect to the server
    var url = wsBaseUrl+'/api/v1/vehicles/' + vehicle.id + '/ws?id=' + id;
    console.log("connecting to " + url);
    // client.connect(url, 'echo-protocol');
    client.connect(url);

  });
}
main();