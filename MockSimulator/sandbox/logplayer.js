/**
 * Created by masayuki on 2016/08/14.
 */
var fs = require('fs');
var request = require('superagent');
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

var baseUrl = 'http://localhost:3000/api/v1';
var wsBaseUrl = 'ws://localhost:3000/api/v1';

// data to send
var vehicle = {
    type: 'veyron',
    location: {lat: 0.0, lon: 0.0},
    velocity: 0.0, // km/h
    acceleration: 0, // m/ss
    angle: 0.0, // rad
    wheel: 0.0, // rad,
    L: 2.0 // m
};

// ------------------------------------------------
// API
// ------------------------------------------------
function newVehicle(callback) {
    // create
    console.log('creating');
    request
        .post(baseUrl+'/vehicles/new')
        .send(vehicle)
        .end(function(err, res) {
            console.log('created');
            vehicle = res.body;
            console.log(vehicle);

            setTimeout(function() {
                callback();
            }, 0);
        });
}
// ------------------------------------------------

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    var filename = "2016-08-13_23:59:16.log";
    var fd = fs.openSync(filename, 'r');
    var buffer = new Buffer(1024);
    var isRunning = true;

    var read, leftOver = '', idx = 0;
    var referenceTime = null;
    var registerNext = (function() {
        return function(data, timestamp) {
            var delta = (referenceTime != null) ? timestamp - referenceTime : 0;
            referenceTime = timestamp;
            setTimeout(function() { handle(data); }, delta / 100);
        };
    })();
    var handle = (function() {
        return function(data) {
            if (data != null) {
                for (key in data.data) {
                    if (key === 'id') continue;
                    vehicle[key] = data.data[key];
                }
                if (isRunning) {
                    console.log(vehicle);
                    connection.send(JSON.stringify(vehicle));
                }
            }
            if ((idx = leftOver.indexOf("\n")) > 0) {
                var line = leftOver.substring(0, idx);
                leftOver = leftOver.substring(idx + 1);

                var logData = JSON.parse(line);
                registerNext(logData.data, logData.timestamp);
            } else {
                if ((read = fs.readSync(fd, buffer, 0, buffer.length, null)) !== 0) {
                    leftOver += buffer.toString('utf8', 0, read);
                    handle(null);
                } else {
                    console.log('end of logfile');
                }
            }
        };
    })();

    setTimeout(function() { handle(); }, 0);

    connection.on('close', function() {
        isRunning = false;
    });
});

newVehicle(function() {
    if (vehicle.id == undefined) {
        throw new Error('Failed to create a new vehicle');
    }
    client.connect(wsBaseUrl + '/vehicles/' + vehicle.id + '/ws?id=iphone-log');
});