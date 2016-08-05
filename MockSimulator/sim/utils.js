/**
 * Utils
 */
var os = require('os');

var Utils = (function() {

  /**
   * Returns local address
   * {@see http://qiita.com/_shimizu/items/b38d1459abf8436f7f1f}
   */
  var getLocalAddress = function() {
    var ifacesObj = {};
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    var interfaces = os.networkInterfaces();

    for (var dev in interfaces) {
      interfaces[dev].forEach(function(details){
        if (!details.internal){
          switch(details.family){
            case "IPv4":
              ifacesObj.ipv4.push({name:dev, address:details.address});
              break;
            case "IPv6":
              ifacesObj.ipv6.push({name:dev, address:details.address});
              break;
          }
        }
      });
    }
    return ifacesObj;
  };


  // --- internal helper method

  // ---

  return {
    getLocalAddress: getLocalAddress
  };
})();

module.exports = Utils;