/**
 * Mockup Simulator Core
 */

T_COEFF = 5000.;

/* constructor */
var Sim = function(nodefile, edgefile) {
  this._nodes = [];
  this._edges = [];
  this._nodeMap = {};
  this._vehicle = {
    type: 'veyron',
    location: {lat: 0, lon: 0},
    velocity: 0.0, // km/h
    acceleration: 0, // m/ss
    angle: 0.0, // rad
    wheel: 0.0, // rad,
    L: 2.0 // m
  };

  this._edgeCurrent = null;
  this._edgeNext = null;
  this._T = 10.0;
  this._t = 0.0;

  this._loadMap(nodefile, edgefile);
  this._initVehicle();
};

/* loads map */
Sim.prototype._loadMap = function(nodefile, edgefile) {
  // load files
  var nodes = require(nodefile);
  var edges = require(edgefile);

  // create node map
  var nodeMap = {};
  for (var i = 0; i < nodes.length; i++) {
    nodeMap[nodes[i].id] = nodes[i];
  }

  this._nodes = nodes;
  this._edges = edges;
  this._nodeMap = nodeMap;
};

/* initialize the vehicle */
Sim.prototype._initVehicle = function() {
  // randomly choose the initial edge to start on
  this._edgeCurrent = this._edges[Math.floor(Math.random() * this._edges.length)];

  // nodes
  var nodeFrom = this._nodeMap[this._edgeCurrent.from];
  var nodeTo = this._nodeMap[this._edgeCurrent.to];

  // setup T
  this._T = T_COEFF*vecLen({x: nodeFrom.lon - nodeTo.lon, y: nodeFrom.lat - nodeTo.lat});

  // set location and angle
  var v1 = {x: nodeTo.lon - nodeFrom.lon, y: nodeTo.lat - nodeFrom.lat};
  var v1len = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
  var angle = (v1.y >= 0) ? - Math.acos(v1.x / v1len) : Math.acos(v1.x / v1len);
  this._vehicle.location.lon = nodeFrom.lon;
  this._vehicle.location.lat = nodeFrom.lat;
  this._vehicle.angle = angle;
};

Sim.prototype.getVehicle = function() {
  return this._vehicle;
};
Sim.prototype.setVehicle = function(vehicle) {
  this._vehicle = vehicle;
};

Sim.prototype._selectNextEdge = function() {
  // find edges that connect to
  var candidates = this._findEdges(this._edgeCurrent.to);
  // randomly choose next node to go to
  return candidates[Math.floor(Math.random() * candidates.length)];
};

Sim.prototype.update = function(delta) {
  this._t += delta;

  // select next edge to go to, if necessary
  if (this._edgeNext === null) {
    this._edgeNext = this._selectNextEdge();
  }

  var nodeFrom;
  var nodeTo;

  // move to next edge
  while (this._T < this._t) {
    console.log('move to next edge');
    this._edgeCurrent = this._edgeNext;
    this._edgeNext = this._selectNextEdge();
    this._t -= this._T;

    nodeFrom = this._nodeMap[this._edgeCurrent.from];
    nodeTo = this._nodeMap[this._edgeCurrent.to];
    this._T = T_COEFF*vecLen({x: nodeFrom.lon - nodeTo.lon, y: nodeFrom.lat - nodeTo.lat});
  }

  var ratio = this._t / this._T;

  // nodes
  var nodeFrom = this._nodeMap[this._edgeCurrent.from];
  var nodeTo = this._nodeMap[this._edgeCurrent.to];

  // current position
  var lon = mix(nodeFrom.lon, nodeTo.lon, ratio);
  var lat = mix(nodeFrom.lat, nodeTo.lat, ratio);
  var v1 = {x: nodeTo.lon - nodeFrom.lon, y: nodeTo.lat - nodeFrom.lat};

  this._vehicle.location.lon = lon;
  this._vehicle.location.lat = lat;
  this._vehicle.angle = -vecRot(v1, {x: 1.0, y: 0.0});
};

/**
 * searches for the edges that match the "from" value
 * @param {string} from from id
 * @returns {Array}
 */
Sim.prototype._findEdges = function(from) {
  var edges = [];
  for (var i = 0; i < this._edges.length; i++) {
    if (this._edges[i].from === from) edges.push(this._edges[i]);
  }
  return edges;
};

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
 * calculate the distance between v1 and v2
 * @param v1
 * @param v2
 * @returns {number}
 */
function vecLen(v) {
  console.log(v);
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
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

module.exports = Sim;
