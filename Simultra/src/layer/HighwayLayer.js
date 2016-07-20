import VIZI from 'vizi';
import extend from 'extend';

import Layer from './Layer';

import Util from '../util/index';

class HighwayLayer extends Layer {
  constructor(options) {
    var defaultOptions = {};

    var _options = extend({}, defaultOptions, options);
    super(_options);

    this._setup();
  }

  _setup() {

    var self = this;

    // Roads from Mapzen
    var viziLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/roads/{z}/{x}/{y}.topojson?api_key=vector-tiles-NT5Emiw', {
      interactive: false,
      style: function(feature) {
        if (feature.properties.lanes) {
          console.log(feature);
        }
        if (feature.properties.width) {
          console.log(feature);
        }

        return Util.HighwayUtils.style(feature, {
          height: 0,
          opacity: 0.2
        });
      },
      filter: function(feature) {
        // Don't show points
        if (feature.geometry.type === 'Point') {
          return false;
        }

        // Convert line to polygon
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
          var lineWidth = Util.HighwayUtils.lineWidth(feature, 1.0);
          var coordss = (feature.geometry.type === 'LineString') ? [feature.geometry.coordinates] : feature.geometry.coordinates;
          var outCoordss = Util.HighwayUtils.lineStringsToPolygon(self._viziLayer._world, coordss, lineWidth);

          feature.geometry.type = 'MultiPolygon';
          feature.geometry.coordinates = outCoordss;
        }

        return true;
      },
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
    });

    // set the instance properties
    this._setViziLayer(viziLayer);

  }
}

export default HighwayLayer;
