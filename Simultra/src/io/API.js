/**
 * API Helper
 */
import WebClient from './WebClient';

// --- API endpoint definitions
const GET_VEHICLES = '/api/v1/vehicles';
const UPDATE_VEHICLES = '/api/v1/vehicles';
const GET_VEHICLE = function(vid) { return '/api/v1/vehicles/' + vid; };

const GET_PEDESTRIANS = '/api/v1/pedestrians';
const UPDATE_PEDESTRIANS = '/api/v1/pedestrians';
const GET_PEDESTRIAN = function(pid) { return '/api/v1/pedestrians/' + pid; };
// ---

class API extends WebClient {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl;
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
  // ---

}

export default API;
