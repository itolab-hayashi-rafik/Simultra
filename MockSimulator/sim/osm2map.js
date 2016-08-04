/**
 * OSM to map
 */
var request = require('superagent');
var fs = require('fs');

function osm2map(features) {
  var nodeMap = {};
  var edges = [];

  features.forEach(function(feature) {
    if (!feature.properties.kind) {
      return;
    }
    if (feature.properties.kind !== 'major_road') {
      return;
    }

    if (feature.geometry.coordinates) {
      var coordinates = feature.geometry.coordinates;
      if (feature.geometry.type === 'LineString') {
        coordinates = [coordinates];
      }

      var prevId = null;
      coordinates.forEach(function(coords) {
        coords.forEach(function(coord) {
          var id = '' + coord[0] + ',' + coord[1];
          if (!(id in nodeMap)) {
            nodeMap[id] = {id: id, lat: coord[1], lon: coord[0]};
          }
          if (prevId) {
            edges.push({from: prevId, to: id});
            edges.push({from: id, to: prevId});
          }
          prevId = id;
        });
      });
    }
  });

  var nodes = [];
  for (key in nodeMap) {
    nodes.push(nodeMap[key]);
  }

  return {
    nodes: nodes,
    edges: edges
  };
}

function save(prefix, nodes, edges) {
  fs.writeFileSync(prefix+'-nodes.json', JSON.stringify(nodes, null, '  '));
  fs.writeFileSync(prefix+'-edges.json', JSON.stringify(edges, null, '  '));
}

function fetch(urls, callback) {
  var count = urls.length;
  var features = [];

  urls.forEach(function(url) {
    request
      .get(url)
      .end(function(err, res) {
        if (err) throw err;
        var data = res.body;
        if (data.features) {
          Array.prototype.push.apply(features, data.features);
        }
        if (--count <= 0) {
          setTimeout(function() {
            callback(features);
          }, 0)
        }
      });
  });
}

function main() {
  // var url = 'https://vector.mapzen.com/osm/roads/18/230780/103697.json?api_key=vector-tiles-NT5Emiw';
  // var url = 'https://vector.mapzen.com/osm/roads/16/57694/25924.json?api_key=vector-tiles-NT5Emiw';
  var urls = [
    // 'https://vector.mapzen.com/osm/roads/16/57693/25922.json?api_key=vector-tiles-NT5Emiw',
    'https://vector.mapzen.com/osm/roads/16/57693/25923.json?api_key=vector-tiles-NT5Emiw',
    'https://vector.mapzen.com/osm/roads/16/57693/25924.json?api_key=vector-tiles-NT5Emiw',
    // 'https://vector.mapzen.com/osm/roads/16/57693/25925.json?api_key=vector-tiles-NT5Emiw',
    // 'https://vector.mapzen.com/osm/roads/16/57693/25926.json?api_key=vector-tiles-NT5Emiw',

    // 'https://vector.mapzen.com/osm/roads/16/57694/25922.json?api_key=vector-tiles-NT5Emiw',
    'https://vector.mapzen.com/osm/roads/16/57694/25923.json?api_key=vector-tiles-NT5Emiw',
    'https://vector.mapzen.com/osm/roads/16/57694/25924.json?api_key=vector-tiles-NT5Emiw',
    // 'https://vector.mapzen.com/osm/roads/16/57694/25925.json?api_key=vector-tiles-NT5Emiw',
    // 'https://vector.mapzen.com/osm/roads/16/57694/25926.json?api_key=vector-tiles-NT5Emiw',

    // 'https://vector.mapzen.com/osm/roads/16/57695/25922.json?api_key=vector-tiles-NT5Emiw',
    'https://vector.mapzen.com/osm/roads/16/57695/25923.json?api_key=vector-tiles-NT5Emiw',
    'https://vector.mapzen.com/osm/roads/16/57695/25924.json?api_key=vector-tiles-NT5Emiw',
    // 'https://vector.mapzen.com/osm/roads/16/57695/25925.json?api_key=vector-tiles-NT5Emiw',
    // 'https://vector.mapzen.com/osm/roads/16/57695/25926.json?api_key=vector-tiles-NT5Emiw',
  ];

  fetch(urls, function(features) {
    res = osm2map(features);
    console.log(res);
    save('highway/4d', res.nodes, res.edges);
    save('highway/4d', res.nodes, res.edges);
  });
}
main();
