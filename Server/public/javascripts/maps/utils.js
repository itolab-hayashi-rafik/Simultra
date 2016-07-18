/**
 * Created by masayuki on 18/07/2016.
 */

if (typeof Simultra === undefined) {
  throw new Error('Simultra not loaded');
}

var Utils = function() {
  var scope = this;

  this.lineStringsToPolygon = function(coordss) {
    var lineWidth = 1.0;

    var cLatLon, pLatLon, nLatLon;
    var cGeoCoord, pGeoCoord, nGeoCoord;
    var vVert = new VIZI.Point(), _vVert   = new VIZI.Point();
    var vMean = new VIZI.Point(), vPadding = new VIZI.Point(), _vPadding = new VIZI.Point();
    var p = new VIZI.Point(), _p;

    var outCoordss = [];

    coordss.forEach(function (coords) {
      var outCoords = [];

      cLatLon = pLatLon = nLatLon = null;
      cGeoCoord = pGeoCoord = nGeoCoord = null;

      for (var i = 0; i < coords.length; i++) {
        cLatLon   = nLatLon   || new VIZI.LatLon(coords[i][1], coords[i][0]);
        cGeoCoord = nGeoCoord || world.latLonToPoint(cLatLon);

        // project the next coordinate
        if (i < coords.length - 1) {
          nLatLon = new VIZI.LatLon(coords[i + 1][1], coords[i + 1][0]);
          nGeoCoord = world.latLonToPoint(nLatLon);

          // calculate the vertical vector
          vVert.x = -(nGeoCoord.y - cGeoCoord.y);
          vVert.y =  (nGeoCoord.x - cGeoCoord.x);
          normalize(vVert);

          // incorpolate the vertical vector with the previous one
          if (i == 0) {
            _vVert.x = vVert.x; _vVert.y = vVert.y;
          }
          vMean.x = (vVert.x + _vVert.x) / 2.0; vMean.y = (vVert.y + _vVert.y) / 2.0;
          normalize(vMean);
          vPadding.x =  vMean.x * lineWidth; vPadding.y =  vMean.y * lineWidth;
        } else {
          vPadding.x = _vVert.x * lineWidth; vPadding.y = _vVert.y * lineWidth;
        }

        // construct polygons
        if (0 < i) {
          if (i == 1) {
            // left top
            p.x = pGeoCoord.x - _vPadding.x; p.y = pGeoCoord.y - _vPadding.y;
            _p = world.pointToLatLon(p);
            outCoords.splice(0, 0, [_p.lon, _p.lat]);

            // left bottom
            p.x = pGeoCoord.x + _vPadding.x; p.y = pGeoCoord.y + _vPadding.y;
            _p = world.pointToLatLon(p);
            outCoords.splice(0, 0, [_p.lon, _p.lat]);
          }

          var idx = outCoords.length / 2;
          // right bottom
          p.x = cGeoCoord.x + vPadding.x; p.y = cGeoCoord.y + vPadding.y;
          _p = world.pointToLatLon(p);
          outCoords.splice(idx, 0, [_p.lon, _p.lat]);

          // right top
          p.x = cGeoCoord.x - vPadding.x; p.y = cGeoCoord.y - vPadding.y;
          _p = world.pointToLatLon(p);
          outCoords.splice(idx + 1, 0, [_p.lon, _p.lat]);
        }

        // keep the vectors as the previous one
        pLatLon = cLatLon;
        pGeoCoord = cGeoCoord;
        _vVert.x = vVert.x; _vVert.y = vVert.y;
        _vPadding.x = vPadding.x; _vPadding.y = vPadding.y;
      }

      outCoords.push(outCoords[0]);
      outCoordss.push([outCoords]);
    });

    return outCoordss;
  }


  // internal helper methods
  /** Normalize VIZI.Point */
  function normalize(p) {
    var l = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
    if (l === 0.0) l = 1.0;
    p.x /= l;
    p.y /= l;
  }

};
var utils = new Utils();
Simultra.Utils = utils;
