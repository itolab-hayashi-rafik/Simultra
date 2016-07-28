/**
 * Worker Utils
 */

var WorkerUtils = (function() {

  /** base directory */
  var base = (function() {
    var current = (function() {
      if (document.currentScript) {
        return document.currentScript.src;
      } else {
        var scripts = document.getElementsByTagName('script');
        var script = scripts[scripts.length - 1];
        if (script.src) {
          return script.src;
        }
      }
    })();
    if (current) {
      return dirname(current);
    }
  })();

  /** Definition: Worker dependencies */
  var dependencies = [
    base + '/simultra-worker.js'
  ];

  /**
   * Returns worker dependencies
   *
   * @returns {string[]}
   */
  var getDependencies = function() {
    return dependencies;
  };

  // --- internal helper methods
  function basename(path) {
    return path.replace(/\\/g, '/').replace(/.*\//, '');
  }
  function dirname(path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');;
  }
  // ---

  // return the utility object
  return {
    getDependencies: getDependencies
  };
})();

export default WorkerUtils;
