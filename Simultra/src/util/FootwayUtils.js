/**
 * Footway Utilities
 */
import VIZI from 'vizi';
import extend from 'extend';

var FootwayUtils = (function() {

  /**
   * Return the style for a specific footway
   *
   * @param {Object} feature
   * @param {Object} defaultValues
   */
  var style = function(feature, defaultValues) {
    var style;

    // Polygon
    if (feature.geometry.type === 'Polygon') {
      style = {
        color: '#ecebe9',
        transparent: true,
        opacity: 0.2
      };
    }
    // Line
    else if (feature.geometry.type === 'LineString') {
      style = {
        lineColor: '#cad9d4',
        lineWidth: 1,
        lineTransparent: true,
        lineOpacity: 0.2,
        lineBlending: THREE.AdditiveBlending,
        lineRenderOrder: 2
      };
    }
    // Point
    else {
      style = {
        pointWidth: 1.0,
        pointHeight: 1.0,
        pointColor: '#0000ff'
      };
    }

    return extend({}, defaultValues, style);
  };

  // return utility object
  return {
    style: style
  };
})();

export default FootwayUtils;
