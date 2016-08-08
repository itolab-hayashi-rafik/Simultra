import VIZI from 'vizi';
import EventEmitter from 'eventemitter3';
import extend from 'extend';
import Stats from 'stats';
import THREEx from 'threex';

import BasemapLayer from './layer/BasemapLayer';
import BuildingLayer from './layer/BuildingLayer';
import FootwayLayer from './layer/FootwayLayer';
import HighwayLayer from './layer/HighwayLayer';
import PedestrianLayer from './layer/PedestrianLayer';
import VehicleLayer from './layer/VehicleLayer';

import API from './io/API';
import Util from './util/index';

class Simultra extends EventEmitter {
  constructor(baseUrl, defaultCoords, options) {
    super();

    var defaultOptions = {
      debug: true,
      renderer: 'cpu'
    };
    this._options = extend({}, defaultOptions, options);

    this._api = new API(baseUrl);
    this._isRunning = false;

    var coords = defaultCoords || [35.156324, 136.923108];

    this._setupWorld(coords);
    this._setupLayers();
    this._setupDebug();
  }

  _setupWorld(coords) {
    var self = this;

    // create a world
    var world = VIZI.world('world', {
      skybox: true,
      postProcessing: false
    }).setView(coords);
    world._environment._skybox.setInclination(0.1);

    // obtain the camera
    var camera = world.getCamera();
    camera.position.set(-150, 175, 125);

    // Add controls
    VIZI.Controls.orbit().addTo(world);

    // add callbacks
    world.on('preUpdate', function(delta) {
      self._onWorldUpdate(delta);
    });

    // set the instance properties
    this._world = world;
  }

  _setupLayers() {
    // Basemap
    this._basemapLayer = new BasemapLayer(this._options).addTo(this);
    // Highway
    this._highwayLayer = new HighwayLayer(this._options).addTo(this);
    // Footway
    this._footwayLayer = new FootwayLayer(this._options).addTo(this);
    // Building
    this._buildingLayer = new BuildingLayer(this._options).addTo(this);
    // Vehicle
    this._vehicleLayer = new VehicleLayer(this._options).addTo(this);
    // Pedestrian
    this._pedestrianLayer = new PedestrianLayer(this._options).addTo(this);
  }

  _setupDebug() {
    if (this._options.debug) {
      // Stats
      if (typeof Stats === 'function') {
        var stats = new Stats();
        stats.dom.style.position = 'absolute';
        stats.dom.style.top = '0px';
        stats.dom.style.zIndex = 100;
        document.body.appendChild(stats.dom);
        this._stats = stats;
      }

      // THREEx.RendererStats
      if (typeof THREEx.RendererStats === 'function') {
        var rendererStats = new THREEx.RendererStats();
        rendererStats.domElement.style.position = 'absolute';
        rendererStats.domElement.style.left = '0px';
        rendererStats.domElement.style.bottom   = '0px';
        document.body.appendChild(rendererStats.domElement);
        this._rendererStats = rendererStats;
      }
    }
  }

  _onWorldUpdate(delta) {
    // for debugging
    if (this._options.debug) {
      // Stats
      if (this._stats) {
        this._stats.update();
      }

      // RenderStats
      if (this._rendererStats) {
        this._rendererStats.update(this._world._engine._renderer);
      }
    }
  }

  /**
   * Sets the center coordinate of the view
   * @param lat latitude
   * @param lon longitude
   */
  setView(lat, lon) {
    this._world.setView([lat, lon]);
  }

  /**
   * Starts updating the view
   */
  start() {
    this._vehicleLayer.start();
    this._pedestrianLayer.start();
    this._isRunning = true;
  }

  /**
   * Stops updating the view
   */
  stop() {
    this._vehicleLayer.stop();
    this._pedestrianLayer.stop();
    this._isRunning = false;
  }

  /**
   * Returns if the view updating loop is running
   *
   * @returns {boolean}
   */
  isRunning() {
    return this._isRunning;
  }
}

export default Simultra;
window.Simultra = Simultra;
