var net = require('net');
var readline = require('readline');

var server = net.createServer();
server.maxConnections = 3;

function Client(socket){
  this.socket = socket;
}

Client.prototype.writeData = function(d){
  var socket = this.socket;
  if(socket.writable){
    var key = socket.remoteAddress + ':' + socket.remotePort;
    process.stdout.write('[' + key + '] - ' + d);
    socket.write('[R]' + d);
  }
};

var clients = {};

server.on('connection', function(socket){
  var status = server.connections + '/' + server.maxConnections;
  var key = socket.remoteAddress + ':' + socket.remotePort;
  console.log('Connection Start(' + status + ') - ' + key);
  clients[key] = new Client(socket);
});

server.on('connection', function(socket){
  var data = '';
  var newline = /\r\n|\n/;
  socket.on('data', function(chunk){
    data += chunk.toString();
    var key = socket.remoteAddress + ':' + socket.remotePort;
    if(newline.test(data)){
      clients[key].writeData(data);
      data = '';
    }
  });
});

server.on('connection', function(socket){
  var key = socket.remoteAddress + ':' + socket.remotePort;
  socket.on('end', function(){
    var status = server.connections + '/' + server.maxConnections;
    console.log('Connection End(' + status + ') - ' + key);
    delete clients[key];
  });
});

server.on('close', function(){
  console.log('Server Closed');
});

server.listen(4000, '0.0.0.0', function(){
  var addr = server.address();
  console.log('Listening Start on Server - ' + addr.address + ':' + addr.port);
});

var rl = readline.createInterface(process.stdin, process.stdout);
rl.on('SIGINT', function(){
  for(var i in clients){
    var socket = clients[i].socket;
    socket.end();
  }
  server.close();
  rl.close();
});