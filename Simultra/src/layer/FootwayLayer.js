import VIZI from 'vizi';
import extend from 'extend';

import Layer from './Layer';
import FootwayUtils from '../util/FootwayUtils';

class FootwayLayer extends Layer {
  constructor(options) {
    var defaultOptions = {

    };

    var _options = extend({}, defaultOptions, options);
    super(_options);

    this._setup();
  }

  _setup() {

    var self = this;

    // Landuses from Mapzen
    // var viziLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/landuse,roads/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
    // var viziLayer = VIZI.topoJSONTileLayer('https://tile.mapzen.com/mapzen/vector/v1/landuse,roads/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
    var viziLayer = VIZI.geoJSONTileLayer('https://tile.mapzen.com/mapzen/vector/v1/landuse,roads/{z}/{x}/{y}.json?api_key=mapzen-2PvEx4B', {
      interactive: false,
      maxLOD: 18,
      style: function(feature) {
        if (feature.properties.lanes) {
          console.log(feature);
        }
        if (feature.properties.width) {
          console.log(feature);
        }

        return FootwayUtils.style(feature, {
          height: 0.5
        });
      },
      filter: function(feature) {
        // Don't show points
        if (feature.geometry.type === 'Point') {
          return false;
        }

        // pedestrian (Polygon)
        if (feature.properties.kind === 'pedestrian') {
          return true;
        }

        // footway (LineString)
        if (feature.properties.highway === 'footway') {
          return true;
        }

        return false;
      },
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
    });

    // set the instance properties
    this._setViziLayer(viziLayer);

  }
}

export default FootwayLayer;
