/**
 * Highway Utilities
 */
import VIZI from 'vizi';
import extend from 'extend';

// --- constants
// jscs:disable disallowSpaceAfterObjectKeys
const COLOR_MAP = {
  'major_road': '#f7c616',
  'minor_road': '#ffffff',
  'highway'   : '#888785',
  'path'      : '#888785',
  'rail'      : '#888785',
};
const WIDTH_MAP = {
  'major'         : 10,
  'primary'       : 10,
  'secondary'     : 7,
  'residental'    : 7,
  'tertiary'      : 5,
  'living_street' : 5,
  'track'         : 3,
  'trunk'         : 3,
  'footway'       : 1,
};
// jscs:enable disallowSpaceAfterObjectKeys
// ---

var HighwayUtils = (function() {

  /**
   * Return the style for a specific highway
   *
   * @param {Object} feature
   */
  var style = function(feature, defaultValue) {
    var color;

    // color
    if (feature.properties.kind) {
      if (feature.properties.kind in COLOR_MAP) {
        color = COLOR_MAP[feature.properties.kind];
      } else {
        // unknown highway kind
        console.info('Unknown highway kind: ' + feature.properties.kind);
      }
    }

    // construct the style
    var style = {
      color: color || defaultValue.color
    };

    return extend({}, defaultValue, style);
  };

  /**
   * Return the line width for a specific highway
   *
   * @param {Object} feature
   */
  var lineWidth = function(feature, defaultValue) {
    var lineWidth;
    if (feature.properties.highway) {
      if (feature.properties.highway in WIDTH_MAP) {
        lineWidth = WIDTH_MAP[feature.properties.highway];
      } else {
        // unknown highway type
        console.info('Unknown highway: ' + feature.properties.highway);
        lineWidth = defaultValue;
      }
    } else {
      // no highway type mentioned
      lineWidth = defaultValue;
    }
    return lineWidth;
  };

  /**
   * Convert LineString to Polygon
   *
   * @param {Object} world VIZI.World object
   * @param {Array} coords LineString, e.g. [[lon, lat], [lon, lat], ...]
   * @param {Number} lineWidth the width of the lines
   */
  var lineStringToPolygon = function(world, coords, lineWidth) {
    return multiLineStringToPolygon(world, [coords], lineWidth);
  };

  /**
   * Convert MultiLineString to Polygon
   *
   * @param {Object} world VIZI.World object
   * @param {Array} coordss Array of LineStrings, e.g. [[[lon, lat], [lon, lat], ...], ...]
   * @param {Number} lineWidth the width of the lines
   * @returns {Array}
   */
  var multiLineStringToPolygon = function(world, coordss, lineWidth) {
    if (lineWidth === undefined) {
      lineWidth = 1.0;
    }

    // jscs:disable disallowMultipleVarDecl
    var cLatLon, pLatLon, nLatLon;
    var cGeoCoord, pGeoCoord, nGeoCoord;
    var vVert = new VIZI.Point(), _vVert   = new VIZI.Point();
    var vMean = new VIZI.Point(), vPadding = new VIZI.Point(), _vPadding = new VIZI.Point();
    var p = new VIZI.Point(), _p;
    // jscs:enable disallowMultipleVarDecl

    var outCoordss = [];

    coordss.forEach(function(coords) {
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

      // add the first vertice at the end to make the polygon closed
      outCoords.push(outCoords[0]);

      // add this polygon to the array of polygons
      outCoordss.push([outCoords]);
    });

    return outCoordss;
  };

  // --- internal helper methods
  /** Normalize VIZI.Point */
  function normalize(p) {
    var l = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
    l = (l === 0.0) ? 1.0 : l;
    p.x /= l;
    p.y /= l;
  }
  // ---

  // return the utility object
  return {
    style: style,
    lineWidth: lineWidth,
    lineStringToPolygon: lineStringToPolygon,
    multiLineStringToPolygon: multiLineStringToPolygon
  };
})();

export default HighwayUtils;
