(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Simultra"] = factory();
	else
		root["Simultra"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _API = __webpack_require__(1);
	
	var _API2 = _interopRequireDefault(_API);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var SimWorker = {
	  API: _API2.default
	};
	
	exports.default = SimWorker;
	
	self.SimWorker = SimWorker;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _WebClient2 = __webpack_require__(2);
	
	var _WebClient3 = _interopRequireDefault(_WebClient2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * API Helper
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */
	
	
	// --- API endpoint definitions
	var GET_VEHICLES = '/api/v1/vehicles';
	var UPDATE_VEHICLES = '/api/v1/vehicles';
	var GET_VEHICLE = function GET_VEHICLE(vid) {
	  return '/api/v1/vehicles/' + vid;
	};
	var WS_VEHICLES = '/api/v1/vehicles-ws';
	var WS_VEHICLE = function WS_VEHICLE(vid) {
	  return '/api/v1/vehicles/' + vid + '/ws';
	};
	
	var GET_PEDESTRIANS = '/api/v1/pedestrians';
	var UPDATE_PEDESTRIANS = '/api/v1/pedestrians';
	var GET_PEDESTRIAN = function GET_PEDESTRIAN(pid) {
	  return '/api/v1/pedestrians/' + pid;
	};
	var WS_PEDESTRIANS = '/api/v1/pedestrians-ws';
	var WS_PEDESTRIAN = function WS_PEDESTRIAN(pid) {
	  return '/api/v1/pedestrians/' + pid + '/ws';
	};
	// ---
	
	var API = function (_WebClient) {
	  _inherits(API, _WebClient);
	
	  function API(baseUrl) {
	    _classCallCheck(this, API);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(API).call(this));
	
	    _this.baseUrl = baseUrl;
	    _this.wsBaseUrl = baseUrl.replace(/^https?:\/\//, 'ws://');
	    return _this;
	  }
	
	  // --- Vehicles
	
	
	  _createClass(API, [{
	    key: 'getVehicles',
	    value: function getVehicles() {
	      return this._ajax({
	        url: this.baseUrl + GET_VEHICLES,
	        method: 'get'
	      });
	    }
	  }, {
	    key: 'updateVehicles',
	    value: function updateVehicles(data) {
	      return this._ajax({
	        url: this.baseUrl + UPDATE_VEHICLES,
	        method: 'put',
	        data: data
	      });
	    }
	  }, {
	    key: 'getVehicle',
	    value: function getVehicle(vid) {
	      return this._ajax({
	        url: this.baseUrl + GET_VEHICLE(vid),
	        method: 'get'
	      });
	    }
	  }, {
	    key: 'wsVehicles',
	    value: function wsVehicles() {
	      return new WebSocket(this.wsBaseUrl + WS_VEHICLES);
	    }
	  }, {
	    key: 'wsVehicle',
	    value: function wsVehicle(vid) {
	      return new WebSocket(this.wsBaseUrl + WS_VEHICLE(vid));
	    }
	    // ---
	
	    // --- Pedestrians
	
	  }, {
	    key: 'getPedestrians',
	    value: function getPedestrians() {
	      return this._ajax({
	        url: this.baseUrl + GET_PEDESTRIANS,
	        method: 'get'
	      });
	    }
	  }, {
	    key: 'updatePedestrians',
	    value: function updatePedestrians(data) {
	      return this._ajax({
	        url: this.baseUrl + UPDATE_PEDESTRIANS,
	        method: 'put',
	        data: data
	      });
	    }
	  }, {
	    key: 'getPedestrian',
	    value: function getPedestrian(pid) {
	      return this._ajax({
	        url: this.baseUrl + GET_PEDESTRIAN(pid),
	        method: 'get'
	      });
	    }
	  }, {
	    key: 'wsPedestrians',
	    value: function wsPedestrians() {
	      return new WebSocket(this.wsBaseUrl + WS_PEDESTRIANS);
	    }
	  }, {
	    key: 'wsPedestrian',
	    value: function wsPedestrian(pid) {
	      return new WebSocket(this.wsBaseUrl + WS_PEDESTRIAN(pid));
	    }
	    // ---
	
	  }]);
	
	  return API;
	}(_WebClient3.default);
	
	exports.default = API;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by masayuki on 28/07/2016.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
	
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var WebClient = function () {
	  function WebClient() {
	    _classCallCheck(this, WebClient);
	  }
	
	  _createClass(WebClient, [{
	    key: '_ajax',
	    value: function _ajax(param) {
	      var defaultParam = {
	        url: null,
	        method: 'GET',
	        data: null,
	        type: 'json'
	      };
	      param = (0, _extend2.default)({}, defaultParam, param);
	
	      return new Promise(function (resolve, reject) {
	        var method = param.method.toUpperCase();
	
	        var xhr = new XMLHttpRequest();
	        xhr.open(method, param.url);
	        xhr.responseType = param.type;
	
	        // set callbacks
	        xhr.onload = function () {
	          if (xhr.status === 200) {
	            resolve(xhr.response);
	          } else {
	            reject(Error(xhr.statusText));
	          }
	        };
	        xhr.onerror = function () {
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
	  }]);
	
	  return WebClient;
	}();
	
	exports.default = WebClient;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	
	var isArray = function isArray(arr) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(arr);
		}
	
		return toStr.call(arr) === '[object Array]';
	};
	
	var isPlainObject = function isPlainObject(obj) {
		if (!obj || toStr.call(obj) !== '[object Object]') {
			return false;
		}
	
		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
		// Not own constructor property must be Object
		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
			return false;
		}
	
		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var key;
		for (key in obj) {/**/}
	
		return typeof key === 'undefined' || hasOwn.call(obj, key);
	};
	
	module.exports = function extend() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0],
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
			target = {};
		}
	
		for (; i < length; ++i) {
			options = arguments[i];
			// Only deal with non-null/undefined values
			if (options != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];
	
					// Prevent never-ending loop
					if (target !== copy) {
						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}
	
							// Never move original objects, clone them
							target[name] = extend(deep, clone, copy);
	
						// Don't bring in undefined values
						} else if (typeof copy !== 'undefined') {
							target[name] = copy;
						}
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
	


/***/ }
/******/ ])
});
;
//# sourceMappingURL=simultra-worker.js.map