/**
 * Random walk simulator
 */
var request = require('superagent');
var WebSocketClient = require('websocket').client;

var baseUrl = 'http://localhost:3000';
var wsBaseUrl = 'ws://localhost:3000';
var offset = 0.0001;
var r_earth = 6378137.0;

var NODES = [
  {id: "名工大前",  lat: 35.156352, lon: 136.923046},
  {id: "花田公園",  lat: 35.160171, lon: 136.923506},
  {id: "若宮大通",  lat: 35.160359, lon: 136.921317},
  {id: "名大病院口", lat: 35.157728, lon: 136.918973},
];
var EDGES = [
  {from: "名工大前",    to: "花田公園"},
  {from: "花田公園",    to: "若宮大通"},
  {from: "若宮大通",    to: "名大病院口"},
  {from: "名大病院口",   to: "名工大前"},
];

// create node map
var NODE_MAP = {};
for (var i = 0; i < NODES.length; i++) {
  NODE_MAP[NODES[i].id] = NODES[i];
}

// data to send
var vehicle = {
  type: 'veyron',
  location: {lat: 35.156324 + offset, lon: 136.923108 + offset},
  velocity: 10.0, // km/h
  acceleration: 0, // m/ss
  angle: 0.0, // rad
  wheel: 0.0, // rad,
  L: 2.0 // m
};

/**
 * searches for the edges that match the "from" value
 * @param {string} from from id
 * @returns {Array}
 */
function findEdges(from) {
  var edges = [];
  for (var i = 0; i < EDGES.length; i++) {
    if (EDGES[i].from === from) edges.push(EDGES[i]);
  }
  return edges;
}

// ------------------------------------------------------------
// API
// ------------------------------------------------------------
function newVehicle(callback) {
  // create
  console.log('creating');
  request
    .post(baseUrl+'/api/v1/vehicles/new')
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

function sendVehicle(callback) {
  // put request
  request
    .put(baseUrl+'/api/v1/vehicles/'+vehicle.id)
    .send(vehicle)
    .end(function(err, res) {
      vehicle = res.body;
      // console.log(vehicle);

      setTimeout(function() {
        callback();
      }, 0);
    });
}
// ------------------------------------------------------------


// ------------------------------------------------------------
// Model
// ------------------------------------------------------------

var T = 10.0;
var t = 0.0;
var referenceTime = 0;
var edgeCurrent = EDGES[0];
var edgeNext = null;
var theta = 0.0;
var wheel = 0.0;

function initVehicle() {
  // nodes
  var nodeFrom = NODE_MAP[edgeCurrent.from];
  var nodeTo = NODE_MAP[edgeCurrent.to];

  // set location and angle
  var v1 = {x: nodeTo.lon - nodeFrom.lon, y: nodeTo.lat - nodeFrom.lat};
  var v1len = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
  var angle = (v1.y >= 0) ? - Math.acos(v1.x / v1len) : Math.acos(v1.x / v1len);
  vehicle.location.lon = nodeFrom.lon;
  vehicle.location.lat = nodeFrom.lat;
  vehicle.angle = angle;
}

// update function
function updateVehicle() {
  // ------------------------
  // compute delta time
  var now = Date.now();
  var delta = (referenceTime > 0) ? (now - referenceTime) / 1000 : 0.0;
  t += delta;
  referenceTime = now;
  // ------------------------

  // select next edge to go to, if necessary
  if (edgeNext === null) {
    // find edges that connect to
    var candidates = findEdges(edgeCurrent.to);
    // randomly choose next node to go to
    edgeNext = candidates[Math.floor(Math.random() * candidates.length)];
    // calculate rotation parameter
    var param = rot(edgeCurrent, edgeNext);
    theta = param.theta;
    wheel = param.wheel;
  }

  var ratio = t / T;

  // move to next edge
  if (1.0 < ratio) {
    console.log('move to next edge');
    edgeCurrent = edgeNext;
    edgeNext = null;
    t = 0.0;
    ratio = 0.0;
  }

  // nodes
  var nodeFrom = NODE_MAP[edgeCurrent.from];
  var nodeTo = NODE_MAP[edgeCurrent.to];

  // current position
  var lon = mix(nodeFrom.lon, nodeTo.lon, ratio);
  var lat = mix(nodeFrom.lat, nodeTo.lat, ratio);
  var v1 = {x: nodeTo.lon - nodeFrom.lon, y: nodeTo.lat - nodeFrom.lat};

  vehicle.location.lon = lon;
  vehicle.location.lat = lat;
  vehicle.angle = -vecRot(v1, {x: 1.0, y: 0.0});
}

/**
 * calculate the rotation difference between v1 and v2
 * @param v1 vector 1
 * @param v2 vector 2
 */
function vecRot(v1, v2) {
  // calculate l1, l2
  var l1 = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
  var l2 = Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2));

  // calculate cos, sin
  var cosPhi1 = v1.x / l1;
  var sinPhi1 = v1.y / l1;
  var cosPhi2 = v2.x / l2;
  var sinPhi2 = v2.y / l2;
  var cosTheta = cosPhi1 * cosPhi2 + sinPhi1 * sinPhi2;
  var sinTheta = sinPhi1 * cosPhi2 - cosPhi1 * sinPhi2;

  // calculate theta
  var theta = (sinTheta >= 0.0) ? Math.acos(cosTheta) : - Math.acos(cosTheta);

  return theta;
}

/**
 * calculate the rotation parameter on the path [e1,e2]
 * @param e1 edge 1
 * @param e2 edge 2
 */
function rot(e1, e2) {
  var n11 = NODE_MAP[e1.from];
  var n12 = NODE_MAP[e1.to];
  var n21 = NODE_MAP[e2.from];
  var n22 = NODE_MAP[e2.to];

  // calculate l1, l2
  var l1 = Math.sqrt(Math.pow((n12.lon - n11.lon), 2) + Math.pow((n12.lat - n11.lat), 2));
  var l2 = Math.sqrt(Math.pow((n22.lon - n21.lon), 2) + Math.pow((n22.lat - n21.lat), 2));

  // calculate cos, sin
  var cosPhi1 = (n12.lon - n11.lon) / l1;
  var sinPhi1 = (n12.lat - n11.lat) / l1;
  var cosPhi2 = (n22.lon - n21.lon) / l2;
  var sinPhi2 = (n22.lat - n21.lat) / l2;
  var cosTheta = cosPhi1 * cosPhi2 + sinPhi1 * sinPhi2;
  var sinTheta = sinPhi1 * cosPhi2 - cosPhi1 * sinPhi2;

  // calculate theta
  var theta = (sinTheta >= 0.0) ? Math.acos(cosTheta) : - Math.acos(cosTheta);

  // calculate lr1 and lr2
  var lr1 = 0.1 * l1;
  var lr2 = 0.1 * l2;

  // calculate wheel
  var wheel = vehicle.L * lr1 / Math.tan((lr1 / (lr1 + lr2)) * theta);

  return {
    theta: theta,
    wheel: wheel
  };
}

/**
 * mix
 * @param {number} v1
 * @param {number} v2
 * @param {number} a
 * @returns {number}
 */
function mix(v1, v2, a) {
  return ((1.0 - a) * v1 + a * v2);
}

// ------------------------------------------------------------


// main function
function main() {
  // initialize the vehicle
  initVehicle();
  newVehicle(function() {
    setTimeout(function() {
      ws();
    }, 0);
  });

  // websocket
  function ws() {
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
      });

      function send(data) {
        if (connection.connected) {
          connection.send(JSON.stringify(data));
        }
      }

      // update loop
      function loop() {
        updateVehicle();
        send(vehicle);
      }
      setInterval(function(){ loop(); }, 100);

    });

    var url = wsBaseUrl+'/api/v1/vehicles/' + vehicle.id + '/ws';
    console.log("connecting to " + url);
    // client.connect(url, 'echo-protocol');
    client.connect(url);
  }
}
main();