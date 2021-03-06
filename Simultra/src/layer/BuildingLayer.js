import VIZI from 'vizi';
import extend from 'extend';

import Layer from './Layer';

import BuildingUtils from '../util/BuildingUtils';

class BuildingLayer extends Layer {
  constructor(options) {
    var defaultOptions = {

    };

    var _options = extend({}, defaultOptions, options);
    super(_options);

    this._setup();
  }

  _setup() {

    // Buildings from Mapzen
    // var viziLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
    // var viziLayer = VIZI.topoJSONTileLayer('https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
    var viziLayer = VIZI.geoJSONTileLayer('https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.json?api_key=mapzen-2PvEx4B', {
      interactive: false,
      maxLOD: 14,
      style: function(feature) {
        return BuildingUtils.style(feature, {
          height: 1,
          lineColor: '#f7c616',
          lineWidth: 1,
          lineTransparent: true,
          lineOpacity: 0.2,
          lineBlending: THREE.AdditiveBlending,
          lineRenderOrder: 2
        });
      },
      filter: function(feature) {
        // Don't show points
        return feature.geometry.type !== 'Point';
      },
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
    });

    // set the instance properties
    this._setViziLayer(viziLayer);

  }
}

export default BuildingLayer;
