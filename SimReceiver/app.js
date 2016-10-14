var net = require('net');
var readline = require('readline');
var Sim = require('./lib/sim');
var api = require('./lib/api');
var WebSocketClient = require('websocket').client;

var wsBaseUrl = 'ws://localhost:3000';

var serverMaxConnections = 100;

// ---- Client ----------------------------------------------------------------
function Client(socket){
  this.socket = socket;
  this.websocket = null;
  this.vehicle = null;
  this.isReady = false;

  this._init({});
}

Client.prototype._init = function(vehicle) {
  var self = this;
  var id = "thisId";

  // create a new vehicle
  api.newVehicle(vehicle, function(vehicle) {
    self.vehicle = vehicle;

    var url = wsBaseUrl+'/api/v1/vehicles/' + vehicle.id + '/ws?id=' + id;

    // create a websocket client
    var client = new WebSocketClient();

    // add the connection failure listener
    client.on('connectFailed', function(error) {
      self.isReady = false;
      console.log('Connect Error: ' + error.toString());
    });

    // on connected
    client.on('connect', function(connection) {
      self.isReady = true;
      console.log('WebSocket Client Connected');

      connection.on('error', function(error) {
        self.isReady = false;
        console.log('WebSocket Connection Error: ' + error);
      });

      connection.on('close', function() {
        self.isReady = false;
        console.log('WebSocket Connection Closed');
      });

      connection.on('message', function(msg) {
        console.log('WebSocket message: ' + msg);
      });
    });

    client.connect(url);
    self.websocket = client;
  });
};

Client.prototype.writeData = function(d){
  var socket = this.socket;
  if(socket.writable){
    var key = socket.remoteAddress + ':' + socket.remotePort;
    process.stdout.write('[' + key + '] - ' + d);
    socket.write('[R]' + d);
  }
};

var clients = {};
// ----------------------------------------------------------------------------


// ---- Server ----------------------------------------------------------------
var server = net.createServer();
server.maxConnections = serverMaxConnections;

// add on connection listener
server.on('connection', function(socket){
  // output to log
  var status = server.connections + '/' + server.maxConnections;
  var key = socket.remoteAddress + ':' + socket.remotePort;
  console.log('Connection Start(' + status + ') - ' + key);
  clients[key] = new Client(socket);

  // add on data input listener
  var data = '';
  var newline = /\r\n|\n/;
  socket.on('data', function(chunk){
    data += chunk.toString();
    if(newline.test(data)){
      // clients[key].writeData(data);
      console.log('line: ' + data);
      data = '';
    }
  });

  // add end connection listener
  socket.on('end', function(){
    var status = server.connections + '/' + server.maxConnections;
    console.log('Connection End(' + status + ') - ' + key);
    delete clients[key];
  });

});

server.on('close', function(){
  console.log('Server Closed');
});

// start the server
server.listen(4000, '0.0.0.0', function(){
  var addr = server.address();
  console.log('Listening Start on Server - ' + addr.address + ':' + addr.port);
});
// ----------------------------------------------------------------------------

var rl = readline.createInterface(process.stdin, process.stdout);
rl.on('SIGINT', function(){
  for(var i in clients){
    var socket = clients[i].socket;
    socket.end();
  }
  server.close();
  rl.close();
});