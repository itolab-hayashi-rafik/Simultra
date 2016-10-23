var net = require('net');
var readline = require('readline');
var Utils = require('./lib/utils');
var api = require('./lib/api');
var WebSocketClient = require('websocket').client;

var wsBaseUrl = 'ws://localhost:3000';

var serverMaxConnections = 100;

// obtain ip address
var ipAddrs = Utils.getLocalAddress();
var ip = ipAddrs.ipv4.length > 0 ? ipAddrs.ipv4[0].address : null;

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
  this.pedestrian = {
    type: 'monkey',
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

Client.prototype._initWsVehicle = function(callback) {
  var self = this;

  self.state = Client.State.CONNECTING;

  // create a new instance
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

Client.prototype._initWsPedestrian = function(callback) {
  var self = this;

  self.state = Client.State.CONNECTING;

  // create a new instance
  api.newPedestrian(this.pedestrian, function(pedestrian) {
    self.pedestrian = pedestrian;
    console.log('[' + self.key + '] - New pedestrian created: ' + JSON.stringify(pedestrian));

    var url = wsBaseUrl+'/api/v1/pedestrians/' + pedestrian.id + '/ws?id=' + self.name;

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
    // process.stdout.write();
    console.log('[' + this.key + '] (out) - ' + d);
    socket.write(d);
  } else {
    console.log('[ERROR] socket not writable: ' + socket);
  }
};

Client.prototype.ack = function() {
  this.writeData("ACK " + this.name);
};

Client.prototype.wsWriteData = function(d) {
  if (this.state == Client.State.CONNECTED) {
    this.wsConnection.send(d);
    console.log('[' + this.key + '] (wsout) - ' + d);
  }
};

Client.prototype.updateVehicle = function(mobility) {
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
  if ('Angle' in mobility) {
    var angle = mobility['Angle'] * Math.PI / 180.; // convert degrees to radians
    angle += -90 * Math.PI / 180.; // TODO: temporary fix, adding -90 degrees to the original angle!!
    vehicle.angle = angle;
    changed = true;
  }
  if ('Speed' in mobility) {
    vehicle.velocity = mobility['speed'];
    // vehicle.velocity = 40 * 1000 / 3600;
    changed = true;
  }

  if (changed) {
    this.wsWriteData(JSON.stringify(vehicle));
  }
};

Client.prototype.updatePedestrian = function(mobility) {
  var pedestrian = this.pedestrian;
  var changed = false;

  if ('Latitude' in mobility) {
    pedestrian.location.lat = mobility['Latitude'];
    changed = true;
  }
  if ('Longitude' in mobility) {
    pedestrian.location.lon = mobility['Longitude'];
    changed = true;
  }
  if ('Angle' in mobility) {
    var angle = mobility['Angle'] * Math.PI / 180.; // convert degrees to radians
    angle += -90 * Math.PI / 180.; // TODO: temporary fix, adding -90 degrees to the original angle!!
    pedestrian.angle = angle;
    changed = true;
  }
  if ('Speed' in mobility) {
    pedestrian.velocity = mobility['speed'];
    changed = true;
  }

  if (changed) {
    this.wsWriteData(JSON.stringify(pedestrian));
  }
};

Client.prototype.onReceiveData = function(data) {
  var self = this;

  console.log('[' + this.key + '] (in) - ' + JSON.stringify(data));

  if ('Mobility' in data) {
    var mobility = data['Mobility'];

    if ('Type' in mobility) {
      var type = mobility['Type'];
      if (type == 0) {
        this.onReceiveVehicleData(mobility);
      } else if (type == 1) {
        this.onReceivePedestrianData(mobility);
      } else {
        console.log('[' + this.key + '] (in) - Unknown type ' + type);
      }
    } else {
      console.log('[' + this.key + '] (in) - Mobility.Type not exists');
    }
  } else {
    console.log('[' + this.key + '] (in) - Mobility not exists');
  }

};

Client.prototype.onReceiveVehicleData = function(mobility) {
  var self = this;

  if ('Name' in mobility) {
    // var name = mobility['Name'] + ' (' + ip + ')';
    var name = ip;
    if (name && this.name !== name) {
      this.name = name;
    }

    // init websocket if needed
    if (this.state == Client.State.NOT_CONNECTED) {
      this._initWsVehicle(function() {
        self.updateVehicle(mobility);
        self.ack();
      });
    }
    // if already initialized, pipe the data to websocket
    else if (this.state == Client.State.CONNECTED) {
      self.updateVehicle(mobility);
      self.ack();
    }
  } else {
    console.log('[' + this.key + '] (in) - Mobility.Name not exists');
  }
};

Client.prototype.onReceivePedestrianData = function(mobility) {
  var self = this;

  if ('Name' in mobility) {
    // var name = mobility['Name'] + ' (' + ip + ')';
    var name = ip;
    if (name && this.name !== name) {
      this.name = name;
    }

    // init websocket if needed
    if (this.state == Client.State.NOT_CONNECTED) {
      this._initWsPedestrian(function() {
        self.updatePedestrian(mobility);
        self.ack();
      });
    }
    // if already initialized, pipe the data to websocket
    else if (this.state == Client.State.CONNECTED) {
      self.updatePedestrian(mobility);
      self.ack();
    }
  } else {
    console.log('[' + this.key + '] (in) - Mobility.Name not exists');
  }
};

Client.prototype.onDisconnected = function() {
  // close websocket if needed
  if (this.state == Client.State.CONNECTED && this.wsConnection) {
    this.wsConnection.close();
    this.wsConnection = null;
    this.state = Client.State.NOT_CONNECTED;
  }

  // delete the vehicle if needed
  if (this.vehicle && this.vehicle.id) {
    api.deleteVehicle(this.vehicle.id, function(vehicle) {
      console.log('deleted the vehicle ' + JSON.stringify(vehicle));
    });
  }

  // delete the pedestrian if needed
  if (this.pedestrian && this.pedestrian.id) {
    api.deletePedestrian(this.pedestrian.id, function(pedestrian) {
      console.log('deleted the pedestrian ' + JSON.stringify(pedestrian));
    });
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
  socket.on('data', function(chunk){
    data += chunk.toString();
    console.log('[' + this.key + '] (in:RAW) - ' + chunk.toString());
    try {
      var json = JSON.parse(data);
      data = '';

      clients[key].onReceiveData(json);
    } catch (e) {
      // do nothing
    }
  });

  // add end connection listener
  socket.on('end', function(){
    var status = server.connections + '/' + server.maxConnections;
    console.log('Connection End(' + status + ') - ' + key);
    try {
      clients[key].onDisconnected();
    } catch (e) {
      // do nothing
    }
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