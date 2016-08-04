/**
 * Pedestrians
 */
var request = require('superagent');

var baseUrl = 'http://localhost:3000';
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
var pedestrian = {
  type: 'monkey',
  location: {lat: 35.156324 + offset, lon: 136.923108 + offset},
  velocity: 0.0, // km/h
  acceleration: 0, // m/ss
  angle: 0.0, // rad
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
function newPedestrian(callback) {
  // create
  console.log('creating');
  request
    .post(baseUrl+'/api/v1/pedestrians/new')
    .send(pedestrian)
    .end(function(err, res) {
      console.log('created');
      vehicle = res.body;
      console.log(pedestrian);

      setTimeout(function() {
        callback();
      }, 0);
    });
}

function sendPedestrian(callback) {
  // put request
  request
    .put(baseUrl+'/api/v1/pedestrian/'+pedestrian.id)
    .send(pedestrian)
    .end(function(err, res) {
      vehicle = res.body;
      // console.log(pedestrian);

      setTimeout(function() {
        callback();
      }, 0);
    });
}
// ------------------------------------------------------------


// main function
function main() {
  newPedestrian(function() {
    setTimeout(function() {
    }, 10);
  });

  // update loop
  // function loop() {
  //   updateVehicle();
  //   sendVehicle(function() {
  //     setTimeout(function() {
  //       loop();
  //     }, 10);
  //   })
  // }
}
main();