/**
 * Websocket
 */
var request = require('superagent');
var WebSocketClient = require('websocket').client;

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
      console.log(data);
    } else {
      console.log('Unknown message type!');
      console.log('typeof msg = '+(typeof msg));
      console.log('Object.keys(msg) = '+(Object.keys(msg)));
    }

    setTimeout(function() {
      send({action: 'getAll'});
    }, 1000);
  });

  function send(data) {
    if (connection.connected) {
      connection.send(JSON.stringify(data));
    }
  }
  send({action: 'getAll'});

});

client.connect('ws://localhost:3000/api/v1/vehicles', 'echo-protocol');