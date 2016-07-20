import VIZI from 'vizi';
import extend from 'extend';

import Layer from './Layer';

import Util from '../util/index';

class BasemapLayer extends Layer {
  constructor(options) {
    var defaultOptions = {};

    var _options = extend({}, defaultOptions, options);
    super(_options);

    this._setup();
  }

  _setup() {
    // CartoDB basemap
    var viziLayer = VIZI.imageTileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    });

    this._setViziLayer(viziLayer);
  }
}

export default BasemapLayer;
