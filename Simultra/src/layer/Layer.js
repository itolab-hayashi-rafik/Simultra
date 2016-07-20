import VIZI from 'vizi';
import EventEmitter from 'eventemitter3';

/**
 * Base Layer class
 */
class Layer extends EventEmitter {
  constructor(options) {
    super();

    // delegate layer
    this._viziLayer = null;
    this._options = options;

    this._simultra = null;
    this._api = null;
  }

  _setViziLayer(viziLayer) {
    this._viziLayer = viziLayer;
  }

  _getViziLayer() {
    return this._viziLayer;
  }

  addTo(simultra) {
    if (this._viziLayer === undefined) {
      throw new Error('Layer not initialized');
    }
    if (simultra._world === undefined) {
      throw new Error('Simultra not initialized');
    }

    this._simultra = simultra;
    this._onAdd(simultra);

    this._viziLayer.addTo(simultra._world);

    return this;
  }

  _onAdd(simultra) {
    this._api = simultra._api;
  }

  remove() {
    this._simultra = null;
    this._onRemove();

    return this;
  }

  _onRemove() {
    // do something when this layer is removed from simultra
  }
}

export default Layer;
