/**
 * API Helper
 */
import jQuery from 'jquery';

// --- API endpoint definitions
const GET_VEHICLES = '/api/v1/vehicles';
const UPDATE_VEHICLES = '/api/v1/vehicles';
const GET_VEHICLE = function(vid) { return '/api/v1/vehicles/' + vid; };

const GET_PEDESTRIANS = '/api/v1/pedestrians';
const UPDATE_PEDESTRIANS = '/api/v1/pedestrians';
const GET_PEDESTRIAN = function(pid) { return '/api/v1/pedestrians/' + pid; };
// ---

class API {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // --- Vehicles
  getVehicles() {
    return $.ajax({
      url: this.baseUrl + GET_VEHICLES,
      method: 'get'
    });
  }

  updateVehicles(data) {
    return $.ajax({
      url: this.baseUrl + UPDATE_VEHICLES,
      method: 'put',
      data: data
    });
  }

  getVehicle(vid) {
    return $.ajax({
      url: this.baseUrl + GET_VEHICLE(vid),
      method: 'get'
    });
  }
  // ---

  // --- Pedestrians
  getPedestrians() {
    return $.ajax({
      url: this.baseUrl + GET_PEDESTRIANS,
      method: 'get'
    });
  }

  updatePedestrians(data) {
    return $.ajax({
      url: this.baseUrl + UPDATE_PEDESTRIANS,
      method: 'put',
      data: data
    });
  }

  getPedestrian(pid) {
    return $.ajax({
      url: this.baseUrl + GET_PEDESTRIAN(pid),
      method: 'get'
    });
  }
  // ---

}

export default API;
