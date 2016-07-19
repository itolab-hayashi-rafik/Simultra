/**
 * Building Utilities
 */
import VIZI from 'vizi';
import extend from 'extend';

var BuildingUtils = (function() {

  /**
   * Return the style for a specific building
   *
   * @param {Object} feature
   * @param {Object} defaultValue
   */
  var style = function(feature, defaultValue) {
    var height;

    if (feature.properties.height) {
      height = feature.properties.height;
    } else {
      height = 10 + Math.random() * 10;
    }

    // construct the style
    var style = {
      height: height || defaultValue.height
    };

    return extend({}, defaultValue, style);
  };

  // return the utility object
  return {
    style: style
  };
})();

export default BuildingUtils;
