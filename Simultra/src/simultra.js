import VIZI from 'vizi';
import EventEmitter from 'eventemitter3';

import BasemapLayer from './layer/BasemapLayer';
import BuildingLayer from './layer/BuildingLayer';
import FootwayLayer from './layer/FootwayLayer';
import HighwayLayer from './layer/HighwayLayer';
import VehicleLayer from './layer/VehicleLayer';

import API from './io/API';
import Util from './util/index';

class Simultra extends EventEmitter {
  constructor(baseUrl, defaultCoords) {
    super();

    this._api = new API(baseUrl);
    this._isRunning = false;

    var coords = defaultCoords || [35.156324, 136.923108];

    this._setupWorld(coords);
    this._setupLayers();
  }

  _setupWorld(coords) {
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

    // set the instance properties
    this._world = world;
  }

  _setupLayers() {
    // Basemap
    this._basemapLayer = new BasemapLayer().addTo(this);
    // Highway
    this._highwayLayer = new HighwayLayer().addTo(this);
    // Footway
    this._footwayLayer = new FootwayLayer().addTo(this);
    // Building
    this._buildingLayer = new BuildingLayer().addTo(this);
    // Vehicle
    this._vehicleLayer = new VehicleLayer().addTo(this);
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
    this._isRunning = true;
  }

  /**
   * Stops updating the view
   */
  stop() {
    this._vehicleLayer.stop();
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
