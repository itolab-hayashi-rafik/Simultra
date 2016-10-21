/**
 * API Helper
 */
import WebClient from './WebClient';

// --- API endpoint definitions
const START_SIMULATION = '/api/v1/start';
const IS_RUNNING = '/api/v1/isRunning';
const STOP_SIMULATION = '/api/v1/stop';

const GET_VEHICLES = '/api/v1/vehicles';
const UPDATE_VEHICLES = '/api/v1/vehicles';
const GET_VEHICLE = function(vid) { return '/api/v1/vehicles/' + vid; };
const WS_VEHICLES = '/api/v1/vehicles-ws';
const WS_VEHICLE = function(vid) { return '/api/v1/vehicles/' + vid + '/ws'; };

const GET_PEDESTRIANS = '/api/v1/pedestrians';
const UPDATE_PEDESTRIANS = '/api/v1/pedestrians';
const GET_PEDESTRIAN = function(pid) { return '/api/v1/pedestrians/' + pid; };
const WS_PEDESTRIANS = '/api/v1/pedestrians-ws';
const WS_PEDESTRIAN = function(pid) { return '/api/v1/pedestrians/' + pid + '/ws'; };
// ---

class API extends WebClient {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl;
    this.wsBaseUrl = baseUrl.replace(/^https?:\/\//, 'ws://');
  }

  // --- Controller
  startSimulation(map, type, scenario) {
    return this._ajax({
      url: this.baseUrl + START_SIMULATION,
      method: 'post',
      data: JSON.stringify({
        map: map,
        type: type,
        scenario: scenario
      })
    });
  }

  isRunning() {
    return this._ajax({
      url: this.baseUrl + IS_RUNNING,
      method: 'get'
    });
  }

  stopSimulation() {
    return this._ajax({
      url: this.baseUrl + STOP_SIMULATION,
      method: 'post'
    });
  }

  // --- Vehicles
  getVehicles() {
    return this._ajax({
      url: this.baseUrl + GET_VEHICLES,
      method: 'get'
    });
  }

  updateVehicles(data) {
    return this._ajax({
      url: this.baseUrl + UPDATE_VEHICLES,
      method: 'put',
      data: data
    });
  }

  getVehicle(vid) {
    return this._ajax({
      url: this.baseUrl + GET_VEHICLE(vid),
      method: 'get'
    });
  }

  wsVehicles() {
    return new WebSocket(this.wsBaseUrl + WS_VEHICLES);
  }

  wsVehicle(vid) {
    return new WebSocket(this.wsBaseUrl + WS_VEHICLE(vid));
  }
  // ---

  // --- Pedestrians
  getPedestrians() {
    return this._ajax({
      url: this.baseUrl + GET_PEDESTRIANS,
      method: 'get'
    });
  }

  updatePedestrians(data) {
    return this._ajax({
      url: this.baseUrl + UPDATE_PEDESTRIANS,
      method: 'put',
      data: data
    });
  }

  getPedestrian(pid) {
    return this._ajax({
      url: this.baseUrl + GET_PEDESTRIAN(pid),
      method: 'get'
    });
  }

  wsPedestrians() {
    return new WebSocket(this.wsBaseUrl + WS_PEDESTRIANS);
  }

  wsPedestrian(pid) {
    return new WebSocket(this.wsBaseUrl + WS_PEDESTRIAN(pid));
  }
  // ---

}

export default API;
