/**
 * Created by masayuki on 2016/08/13.
 */
var fs = require('fs');
var WebSocketClient = require('websocket').client;
var moment = require("moment");

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    var filename = moment().format('YYYY-MM-DD_HH:mm:ss') + '.log';
    var fout = fs.createWriteStream(filename);

    connection.on('message', function(msg) {
        if (msg.type === 'utf8') {
            var data = JSON.parse(msg.utf8Data);
            var logData = {
                timestamp: Date.now(),
                data: data
            };
            // console.log(data);
            fout.write(JSON.stringify(logData));
            fout.write("\n");
        } else {
            console.log('Unknown message type!');
            console.log('typeof msg = '+(typeof msg));
            console.log('Object.keys(msg) = '+(Object.keys(msg)));
        }
    });

    connection.on('close', function() {
        fout.end();
    });
});

client.connect('ws://chino.itolab.nitech.ac.jp:3000/api/v1/vehicles/all/ws');