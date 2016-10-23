import VIZI from 'vizi';
import extend from 'extend';

import Layer from './Layer';

import API from '../io/API';

import WorkerUtils from '../util/WorkerUtils';

const UPDATE_INTERVAL_MS = 1000;

class PedestrianLayer extends Layer {
  constructor(options) {
    var defaultOptions = {
      renderer: 'cpu'
    };

    var _options = extend({}, defaultOptions, options);
    super(_options);

    this._pedestrians = [];

    this._setup();
  }

  _setup() {

    // pedestrian layer
    var viziLayer = VIZI.pedestrianLayer({
      'monkey': {
        file: {
          body: '/javascripts/maps/json/monkey/monkey.json',
        },
        scale: 1.0,
        translation: {x: 0, y: 0, z: 0},
        rotation: {x: 0, y: 0, z: 0}
      }
    }, {
      enableGpuComputation: this._options.renderer === 'gpu',
      simWidth: 32,
      style: {
        height: 0
      }
    });

    // set the instance property
    this._setViziLayer(viziLayer);

  }

  _onAdd(simultra) {
    super._onAdd(simultra);

    // create the worker thread for websocket
    this._worker = operative(this._createWorker(), WorkerUtils.getDependencies());
  }

  _onRemove() {
    super._onRemove();

    // destroy the worker
    this._worker = null;
  }

  /**
   * Starts updating the view
   */
  start() {
    this._isRunning = true;

    var self = this;

    // start all of the workers
    this._worker.start(this._createWorkerCallback());

    // start pedestrian manager
    var ws = this._api.wsPedestrians();
    ws.onclose = function(event) {
      console.log('closed pedestrian manager');
    };
    ws.onmessage = function(event) {
      self._onMessage(event.data);
    };
    ws.onopen = function() {
      console.log('opened pedestrian manager');
    };
    this._ws = ws;

    setTimeout(function() { self._update(); }, 0);
  }

  /**
   * Stops updating the view
   */
  stop() {
    this._isRunning = false;

    // terminate pedestrian manager
    if (this._ws) {
      this._ws.close();
    }

    // terminate all of the workers
    this._worker.stop();
  }

  _onMessage(data) {
    var self = this;
    if (data === 'creation') {
      setTimeout(function() { self._update(); }, 0);
    } else if (data === 'deletion') {
      setTimeout(function() { self._update(); }, 0);
    } else {
      console.error('unknown message ' + data);
    }
  }

  // (rest)
  // _update() {
  //   var self = this;
  //
  //   if (this._isRunning) {
  //
  //     this._lastUpdatedAt = Date.now();
  //
  //     this._api.getPedestrians()
  //       .then(function(data) {
  //
  //         self._performUpdate(data);
  //
  //       }).catch(function(err) {
  //
  //       console.error('Error updating the pedestrian layer:' + err);
  //
  //     }).then(function() {
  //
  //       if (self._isRunning) {
  //         // calculate the delay
  //         var lastUpdate = self._lastUpdatedAt;
  //         var now = Date.now();
  //         var delay = UPDATE_INTERVAL_MS - (now - lastUpdate);
  //
  //         // register the next update
  //         setTimeout(function() { self._update(); }, (delay > 0) ? delay : 0);
  //       }
  //
  //     });
  //
  //   }
  // }

  // (websocket)
  _update() {
    var self = this;

    if (this._isRunning) {

      this._lastUpdatedAt = Date.now();

      this._api.getPedestrians()
        .then(function(data) {

          self._performUpdate(data);

        }).catch(function(err) {

        console.error('Error updating the pedestrian layer:' + err);

      });
    }
  }

  _performUpdate(data) {
    var self = this;
    var viziLayer = this._getViziLayer();

    // map pedestrian parameters into dictionaries
    data.forEach(pedestrian => {
      // if pedestrian does not exist
      if (!self._hasPedestrian(pedestrian)) {
        // add to pedestrian layer
        self._addPedestrian(pedestrian);
      }
    });

  }

  _hasPedestrian(pedestrian) {
    return (pedestrian.id in this._pedestrians);
  }

  _addPedestrian(pedestrian) {
    var viziLayer = this._getViziLayer();

    // add pedestrian to the vizi layer
    var object = viziLayer.addPedestrian(
      pedestrian.type,
      new VIZI.LatLon(pedestrian.location.lat, pedestrian.location.lon),
      pedestrian.angle
    );

    // add entry to dictionary
    var entry = {
      data: pedestrian,
      object: object
    };
    this._pedestrians[pedestrian.id] = entry;

    console.log('added pedestrian: ' + JSON.stringify(pedestrian));
    return entry;
  }

  // (websocket)
  _createWorker() {
    var baseUrl = this._api.baseUrl;
    return {
      _baseUrl: baseUrl,
      _api: null,
      _callback: null,
      _isRunning: false,

      /** start updating the pedestrian */
      start: function(callback) {
        this._api = new SimWorker.API(this._baseUrl);
        this._callback = callback;
        this._isRunning = true;

        var self = this;
        setTimeout(function() { self._update(); }, self._interval);
      },

      _update: function() {
        var self = this;

        var socket = this._api.wsAllPedestrians();
        socket.onclose = function(event) {
          self._isRunning = false;
          console.log('closed pedestrian websocket');
        };
        socket.onmessage = function(event) {
          // here, "event" is an instance of MessageEvent, which cannot be serialized to send to the UI thread,
          // hence, we just extract the data object (sent by another peer) and transfer it to the UI thread.
          // console.log(event.data);
          if (event.data) {
            self._callback(JSON.parse(event.data));
          }
        };
        socket.onopen = function() {
          console.log('opened pedestrian websocket');
        };
      },

      /** stop updating */
      stop: function() {
        this._isRunning = false;
      }
    };
  }

  _createWorkerCallback() {
    return (function(that) {
      var prevSender = '';
      return function(msg) {
        var sender = msg.sender;
        var pedestrian = msg.data;

        var viziLayer = that._getViziLayer();

        // update the object in vizi layer
        if (prevSender !== sender) {
          viziLayer.setLabelClass(pedestrian.id, 'label pedestrian');
          viziLayer.setLabelText(pedestrian.id, sender);
          prevSender = sender;
        }
        viziLayer.setLocation(pedestrian.id, pedestrian.location.lat, pedestrian.location.lon, -pedestrian.angle);
        viziLayer.setVelocity(pedestrian.id, pedestrian.velocity, 0, 0, 0);
      };
    })(this);
  }

}

export default PedestrianLayer;
