/**
 * API Helper
 */
import jQuery from 'jquery';

// --- API endpoint definitions
const GET_VEHICLES = '/api/v1/vehicles';
const UPDATE_VEHICLES = '/api/v1/vehicles';
const GET_VEHICLE = function(vid) { return '/api/v1/vehicles/' + vid; };
// ---

class API {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

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

}

export default API;
