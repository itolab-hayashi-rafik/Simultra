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
      renderer: 'cpu',
      renderBasemap: true,
      renderHighway: true,
      renderFootway: true,
      renderBuilding: true,
      renderVehicle: true,
      renderPedestrian: true,
      fixCamera: false,
    };
    this._options = extend({}, defaultOptions, options);

    this._api = new API(baseUrl);
    this._isRunning = false;

    this._focusedObject = null;

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
    var control = VIZI.Controls.orbit().addTo(world);
    this._control = control;

    // add callbacks
    world.on('preUpdate', function(delta) {
      self._onWorldUpdate(delta);
    });

    // set the instance properties
    this._world = world;
  }

  _setupLayers() {
    // Basemap
    this._basemapLayer    = this._options.renderBasemap    ? new BasemapLayer(this._options).addTo(this)    : null;
    // Highway
    this._highwayLayer    = this._options.renderHighway    ? new HighwayLayer(this._options).addTo(this)    : null;
    // Footway
    this._footwayLayer    = this._options.renderFootway    ? new FootwayLayer(this._options).addTo(this)    : null;
    // Building
    this._buildingLayer   = this._options.renderBuilding   ? new BuildingLayer(this._options).addTo(this)   : null;
    // Vehicle
    this._vehicleLayer    = this._options.renderVehicle    ? new VehicleLayer(this._options).addTo(this)    : null;
    // Pedestrian
    this._pedestrianLayer = this._options.renderPedestrian ? new PedestrianLayer(this._options).addTo(this) : null;
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

    // focus
    this._updateCameraPosition();
  }

  lookAtLatLon(latLon) {
    var point = this._world.latLonToPoint(latLon);
    this.lookAtPoint(point);
  }

  lookAtPoint(point) {
    // camera.lookAt(moveTarget); // TODO: this does not work. OrbitControl.js overrides this function!!

    // camera ref
    var camera = this._world.getCamera();
    var target = this._control._controls.target;

    // target to move to
    var moveTarget = new THREE.Vector3(point.x, 0, point.y);

    // apply!
    target.copy(moveTarget);
  }

  moveToLatLon(latLon) {
    var point = this._world.latLonToPoint(latLon);
    this.moveToPoint(point);
  }

  moveToPoint(point) {
    // camera ref
    var camera = this._world.getCamera();
    var target = this._control._controls.target;

    // camera offset
    var offset = new THREE.Vector3();
    offset.copy(camera.position).sub(target);

    // target to move to
    var moveTarget = new THREE.Vector3(point.x, 0, point.y);

    // apply!
    target.copy(moveTarget);
    camera.position.copy(target).add(offset);
  }

  /**
   * Sets the center coordinate of the view
   * @param lat latitude
   * @param lon longitude
   */
  flyToLatLon(latLon, time, zoom) {
    this._control.flyToLatLon(latLon, time, zoom);
  }

  /**
   * Flyies to the point
   * @param point
   */
  flyToPoint(point, time, zoom) {
    this._control.flyToPoint(point, time, zoom);
  }

  /**
   * Starts updating the view
   */
  start() {
    this._vehicleLayer    && this._vehicleLayer.start();
    this._pedestrianLayer && this._pedestrianLayer.start();
    this._isRunning = true;
  }

  /**
   * Stops updating the view
   */
  stop() {
    this._vehicleLayer    && this._vehicleLayer.stop();
    this._pedestrianLayer && this._pedestrianLayer.stop();
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

  /**
   * Controls the remote to start the simulation
   *
   * @param map
   * @param type
   * @param scenario
   */
  startSimulation(map, type, scenario) {
    return this._api.startSimulation(map, type, scenario);
  }

  /**
   * Returns if the simulation is running
   * @returns {*}
   */
  isSimulationRunning() {
    return this._api.isRunning();
  }

  /**
   * Controls the remote to stop the simulation
   */
  stopSimulation() {
    return this._api.stopSimulation();
  }

  /**
   * Updates the camera position to follow the vehicles
   *
   * @private
   */
  _updateCameraPosition() {
    if (this._focusedObject != null) {
      var object = this._focusedObject;
      var latLon = !('latLon' in object) ? null : (typeof object.latLon === 'function') ? object.latLon() : object.latLon;
      var point = !('point' in object) ? null : (typeof object.point === 'function') ? object.point() : object.point;

      if (latLon != null) {
        this._options.fixCamera ? this.lookAtLatLon(latLon) : this.moveToLatLon(latLon);
      } else if (point != null) {
        this._options.fixCamera ? this.lookAtPoint(point) : this.moveToPoint(point);
      }
    }
  }

  /**
   * Focuses on an object
   *
   * @param object an object that has either a function or property named "latLon" that returns VIZI.LatLon location or "point" that returns VIZI.point position
   */
  focusOn(object) {
    if (object != null && !('latLon' in object) && !('point' in object)) {
      throw new Error('object needs to have a property or function named "latLon" that returns VIZI.LatLon location or "point" that returns VIZI.Point position');
    }
    this._focusedObject = object;
  }

  /**
   * Focuses on a vehicle
   *
   * @param vid
   */
  focusOnVehicle(vid) {
    // proxy VehicleLayer#focusOn()
    this._vehicleLayer && this._vehicleLayer.focusOn(vid);
  }

  /**
   * Focuses on a pedestrian
   *
   * @param pid
   */
  focusOnPedestrian(pid) {
    // proxy PedestrianLayer#focusOn()
    this._pedestrianLayer && this._pedestrianLayer.focusOn(pid);
  }
}

export default Simultra;
window.Simultra = Simultra;
