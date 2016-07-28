/**
 * Created by masayuki on 28/07/2016.
 */
import extend from 'extend';

class WebClient {
  constructor() {

  }

  _ajax(param) {
    var defaultParam = {
      url: null,
      method: 'GET',
      data: null,
      type: 'json'
    };
    param = extend({}, defaultParam, param);

    return new Promise(function(resolve, reject) {
      var method = param.method.toUpperCase();

      var xhr = new XMLHttpRequest();
      xhr.open(method, param.url);
      xhr.responseType = param.type;

      // set callbacks
      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(Error(xhr.statusText));
        }
      };
      xhr.onerror = function() {
        reject(Error('Network Error'));
      };

      // send data if exists
      if ((method === 'POST' || method === 'PUT') && param.data) {
        xhr.send(param.data);
      }
      // or send the request without data
      else {
        xhr.send();
      }
    });
  }

}

export default WebClient;
