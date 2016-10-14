var net = require('net');
var readline = require('readline');
var Sim = require('./lib/sim');
var api = require('./lib/api');
var WebSocketClient = require('websocket').client;

var wsBaseUrl = 'ws://localhost:3000';

var serverMaxConnections = 100;

// ---- Client ----------------------------------------------------------------
function Client(socket) {
  this.name = undefined;
  this.key = socket.remoteAddress + ':' + socket.remotePort;
  this.socket = socket;
  this.websocket = null;
  this.wsConnection = null;
  this.vehicle = {
    type: 'veyron',
    location: {
      lat: 35.169555,
      lon: 136.900831
    }
  };
  this.state = Client.State.NOT_CONNECTED;
}

Client.State = {
  NOT_CONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2
};

Client.prototype._initWebsocket = function(callback) {
  var self = this;

  self.state = Client.State.CONNECTING;

  // create a new vehicle
  api.newVehicle(this.vehicle, function(vehicle) {
    self.vehicle = vehicle;
    console.log('[' + self.key + '] - New vehicle created: ' + JSON.stringify(vehicle));

    var url = wsBaseUrl+'/api/v1/vehicles/' + vehicle.id + '/ws?id=' + self.name;

    // create a websocket client
    var client = new WebSocketClient();

    // add the connection failure listener
    client.on('connectFailed', function(error) {
      self.state = Client.State.NOT_CONNECTED;
      console.log('[' + self.key + '] - Connect Error: ' + error.toString());
    });

    // on connected
    client.on('connect', function(connection) {
      self.state = Client.State.CONNECTED;
      self.wsConnection = connection;
      console.log('[' + self.key + '] - WebSocket Client Connected');

      connection.on('error', function(error) {
        self.state = Client.State.NOT_CONNECTED;
        self.wsConnection = null;
        console.log('[' + self.key + '] - WebSocket Connection Error: ' + error);
      });

      connection.on('close', function() {
        self.state = Client.State.NOT_CONNECTED;
        self.wsConnection = null;
        console.log('[' + self.key + '] - WebSocket Connection Closed');
      });

      connection.on('message', function(msg) {
        if (msg.type === 'utf8') {
          var data = msg.utf8Data;
          console.log('[' + self.key + '] - ' + data);
        } else if (msg.type === 'binary') {
          var data = msg.binaryData;
          console.log('[' + self.key + '] - binary data');
        } else {
          console.log('[' + self.key + '] - Unknown message type!');
          console.log('[' + self.key + '] - typeof msg = '+(typeof msg));
          console.log('[' + self.key + '] - Object.keys(msg) = '+(Object.keys(msg)));
        }
      });

      callback();
    });

    client.connect(url);
    self.websocket = client;
  });
};

Client.prototype.writeData = function(d) {
  var socket = this.socket;
  if(socket.writable){
    process.stdout.write('[' + this.key + '] - ' + d);
    socket.write(d);
  } else {
    console.log('[ERROR] socket not writable: ' + JSON.stringify(socket));
  }
};

Client.prototype.ack = function() {
  this.writeData("ACK " + this.name);
};

Client.prototype.wsWriteData = function(d) {
  if (this.state == Client.State.CONNECTED) {
    this.wsConnection.send(d);
  }
};

Client.prototype.update = function(mobility) {
  var vehicle = this.vehicle;
  var changed = false;

  if ('Latitude' in mobility) {
    vehicle.location.lat = mobility['Latitude'];
    changed = true;
  }
  if ('Longitude' in mobility) {
    vehicle.location.lon = mobility['Longitude'];
    changed = true;
  }

  if (changed) {
    this.wsWriteData(JSON.stringify(vehicle));
  }
};

Client.prototype.onReceiveData = function(data) {
  var self = this;

  console.log('[' + this.key + '] - ' + JSON.stringify(data));

  if ('Mobility' in data) {
    var mobility = data['Mobility'];

    if ('Name' in mobility) {
      var name = mobility['Name'];
      if (name && this.name !== name) {
        this.name = name;
      }

      // init websocket if needed
      if (this.state == Client.State.NOT_CONNECTED) {
        this._initWebsocket(function() {
          self.update(mobility);
          self.ack();
        });
      }
      // if already initialized, pipe the data to websocket
      else if (this.state == Client.State.CONNECTED) {
        self.update(mobility);
        self.ack();
      }
    } else {
      console.log('[' + this.key + '] - Mobility.Name not exists');
    }
  } else {
    console.log('[' + this.key + '] - Mobility not exists');
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
    try {
      var json = JSON.parse(data);
      data = '';

      clients[key].onReceiveData(json);
    } catch (e) {
      // do nothing
    }
    // if(newline.test(data)){
      // clients[key].writeData(data);
      // console.log('line: ' + data);
      // data = '';
    // }
  });

  // add end connection listener
  socket.on('end', function(){
    var status = server.connections + '/' + server.maxConnections;
    console.log('Connection End(' + status + ') - ' + key);
    delete clients[key];
  });

  // --- start the receiver! ---
  // send something first
  clients[key].writeData("1");

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