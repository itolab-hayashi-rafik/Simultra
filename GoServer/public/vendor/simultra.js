(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("VIZI"), require("Stats"), require("THREEx"), require("operative"));
	else if(typeof define === 'function' && define.amd)
		define(["VIZI", "Stats", "THREEx", "operative"], factory);
	else if(typeof exports === 'object')
		exports["Simultra"] = factory(require("VIZI"), require("Stats"), require("THREEx"), require("operative"));
	else
		root["Simultra"] = factory(root["VIZI"], root["Stats"], root["THREEx"], root["operative"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_20__) {
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
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _eventemitter = __webpack_require__(2);
	
	var _eventemitter2 = _interopRequireDefault(_eventemitter);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	var _stats = __webpack_require__(4);
	
	var _stats2 = _interopRequireDefault(_stats);
	
	var _threex = __webpack_require__(5);
	
	var _threex2 = _interopRequireDefault(_threex);
	
	var _BasemapLayer = __webpack_require__(6);
	
	var _BasemapLayer2 = _interopRequireDefault(_BasemapLayer);
	
	var _BuildingLayer = __webpack_require__(13);
	
	var _BuildingLayer2 = _interopRequireDefault(_BuildingLayer);
	
	var _FootwayLayer = __webpack_require__(14);
	
	var _FootwayLayer2 = _interopRequireDefault(_FootwayLayer);
	
	var _HighwayLayer = __webpack_require__(15);
	
	var _HighwayLayer2 = _interopRequireDefault(_HighwayLayer);
	
	var _PedestrianLayer = __webpack_require__(16);
	
	var _PedestrianLayer2 = _interopRequireDefault(_PedestrianLayer);
	
	var _VehicleLayer = __webpack_require__(19);
	
	var _VehicleLayer2 = _interopRequireDefault(_VehicleLayer);
	
	var _API = __webpack_require__(17);
	
	var _API2 = _interopRequireDefault(_API);
	
	var _index = __webpack_require__(8);
	
	var _index2 = _interopRequireDefault(_index);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Simultra = function (_EventEmitter) {
	  _inherits(Simultra, _EventEmitter);
	
	  function Simultra(baseUrl, defaultCoords, options) {
	    _classCallCheck(this, Simultra);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Simultra).call(this));
	
	    var defaultOptions = {
	      debug: true,
	      renderer: 'cpu',
	      renderBasemap: true,
	      renderHighway: true,
	      renderFootway: true,
	      renderBuilding: true,
	      renderVehicle: true,
	      renderPedestrian: true,
	      followVehicles: false
	    };
	    _this._options = (0, _extend2.default)({}, defaultOptions, options);
	
	    _this._api = new _API2.default(baseUrl);
	    _this._isRunning = false;
	
	    var coords = defaultCoords || [35.156324, 136.923108];
	
	    _this._setupWorld(coords);
	    _this._setupLayers();
	    _this._setupDebug();
	    return _this;
	  }
	
	  _createClass(Simultra, [{
	    key: '_setupWorld',
	    value: function _setupWorld(coords) {
	      var self = this;
	
	      // create a world
	      var world = _vizi2.default.world('world', {
	        skybox: true,
	        postProcessing: false
	      }).setView(coords);
	      world._environment._skybox.setInclination(0.1);
	
	      // obtain the camera
	      var camera = world.getCamera();
	      camera.position.set(-150, 175, 125);
	
	      // Add controls
	      var control = _vizi2.default.Controls.orbit().addTo(world);
	      this._control = control;
	
	      // add callbacks
	      world.on('preUpdate', function (delta) {
	        self._onWorldUpdate(delta);
	      });
	
	      // set the instance properties
	      this._world = world;
	    }
	  }, {
	    key: '_setupLayers',
	    value: function _setupLayers() {
	      // Basemap
	      this._basemapLayer = this._options.renderBasemap ? new _BasemapLayer2.default(this._options).addTo(this) : null;
	      // Highway
	      this._highwayLayer = this._options.renderHighway ? new _HighwayLayer2.default(this._options).addTo(this) : null;
	      // Footway
	      this._footwayLayer = this._options.renderFootway ? new _FootwayLayer2.default(this._options).addTo(this) : null;
	      // Building
	      this._buildingLayer = this._options.renderBuilding ? new _BuildingLayer2.default(this._options).addTo(this) : null;
	      // Vehicle
	      this._vehicleLayer = this._options.renderVehicle ? new _VehicleLayer2.default(this._options).addTo(this) : null;
	      // Pedestrian
	      this._pedestrianLayer = this._options.renderPedestrian ? new _PedestrianLayer2.default(this._options).addTo(this) : null;
	    }
	  }, {
	    key: '_setupDebug',
	    value: function _setupDebug() {
	      if (this._options.debug) {
	        // Stats
	        if (typeof _stats2.default === 'function') {
	          var stats = new _stats2.default();
	          stats.dom.style.position = 'absolute';
	          stats.dom.style.top = '0px';
	          stats.dom.style.zIndex = 100;
	          document.body.appendChild(stats.dom);
	          this._stats = stats;
	        }
	
	        // THREEx.RendererStats
	        if (typeof _threex2.default.RendererStats === 'function') {
	          var rendererStats = new _threex2.default.RendererStats();
	          rendererStats.domElement.style.position = 'absolute';
	          rendererStats.domElement.style.left = '0px';
	          rendererStats.domElement.style.bottom = '0px';
	          document.body.appendChild(rendererStats.domElement);
	          this._rendererStats = rendererStats;
	        }
	      }
	    }
	  }, {
	    key: '_onWorldUpdate',
	    value: function _onWorldUpdate(delta) {
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
	
	      // follow the car
	      if (this._options.followVehicles) {
	        this._updateCameraPosition();
	      }
	    }
	  }, {
	    key: 'lookAtLatLon',
	    value: function lookAtLatLon(latLon) {
	      var point = this._world.latLonToPoint(latLon);
	      this.lookAtPoint(point);
	    }
	  }, {
	    key: 'lookAtPoint',
	    value: function lookAtPoint(point) {
	      var camera = this._world.getCamera();
	      var moveTarget = new THREE.Vector3(point.x, 0, point.y);
	      // camera.lookAt(moveTarget); // TODO: this does not work. OrbitControl.js overrides this function!!
	      this._control._controls.target = moveTarget;
	    }
	
	    /**
	     * Sets the center coordinate of the view
	     * @param lat latitude
	     * @param lon longitude
	     */
	
	  }, {
	    key: 'flyToLatLon',
	    value: function flyToLatLon(latLon) {
	      // this._world.setView([lat, lon]); // this does not work
	      // if (!('_flyTween' in this._control) || this._control._flyTween == null || !this._control._flyTween.isActive()) {
	      //   this._control.flyToLatLon(latLon, 1); // FIXME: find a way to move without the animation
	      // }
	      var point = this._world.latLonToPoint(latLon);
	      this.flyToPoint(point);
	    }
	
	    /**
	     * Flyies to the point
	     * @param point
	     */
	
	  }, {
	    key: 'flyToPoint',
	    value: function flyToPoint(point) {
	      // this._control.flyToPoint(point, 0.00000001);
	      var flyTarget = new THREE.Vector3(point.x, 0, point.y);
	      var diff = new THREE.Vector3().subVectors(this._control._controls.target, flyTarget);
	      this._control._controls.panLeft(diff.x, this._control._controls.object.matrix);
	      this._control._controls.panUp(diff.z, this._control._controls.object.matrix);
	    }
	
	    /**
	     * Starts updating the view
	     */
	
	  }, {
	    key: 'start',
	    value: function start() {
	      this._vehicleLayer && this._vehicleLayer.start();
	      this._pedestrianLayer && this._pedestrianLayer.start();
	      this._isRunning = true;
	    }
	
	    /**
	     * Stops updating the view
	     */
	
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this._vehicleLayer && this._vehicleLayer.stop();
	      this._pedestrianLayer && this._pedestrianLayer.stop();
	      this._isRunning = false;
	    }
	
	    /**
	     * Returns if the view updating loop is running
	     *
	     * @returns {boolean}
	     */
	
	  }, {
	    key: 'isRunning',
	    value: function isRunning() {
	      return this._isRunning;
	    }
	
	    /**
	     * Controls the remote to start the simulation
	     * @param map
	     * @param type
	     * @param scenario
	     */
	
	  }, {
	    key: 'startSimulation',
	    value: function startSimulation(map, type, scenario) {
	      return this._api.startSimulation(map, type, scenario);
	    }
	
	    /**
	     * Returns if the simulation is running
	     * @returns {*}
	     */
	
	  }, {
	    key: 'isSimulationRunning',
	    value: function isSimulationRunning() {
	      return this._api.isRunning();
	    }
	
	    /**
	     * Controls the remote to stop the simulation
	     */
	
	  }, {
	    key: 'stopSimulation',
	    value: function stopSimulation() {
	      return this._api.stopSimulation();
	    }
	
	    /**
	     * update the camera position to follow the vehicles
	     * @private
	     */
	
	  }, {
	    key: '_updateCameraPosition',
	    value: function _updateCameraPosition() {
	      if (this._options.followVehicles) {
	        var latLon = this._vehicleLayer.getCentroid();
	        if (latLon != null) {
	          this.lookAtLatLon(latLon);
	        }
	      }
	    }
	  }]);
	
	  return Simultra;
	}(_eventemitter2.default);
	
	exports.default = Simultra;
	
	window.Simultra = Simultra;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var has = Object.prototype.hasOwnProperty;
	
	//
	// We store our EE objects in a plain object whose properties are event names.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// `~` to make sure that the built-in object properties are not overridden or
	// used as an attack vector.
	// We also assume that `Object.create(null)` is available when the event name
	// is an ES6 Symbol.
	//
	var prefix = typeof Object.create !== 'function' ? '~' : false;
	
	/**
	 * Representation of a single EventEmitter function.
	 *
	 * @param {Function} fn Event handler to be called.
	 * @param {Mixed} context Context for function execution.
	 * @param {Boolean} [once=false] Only emit once
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}
	
	/**
	 * Minimal EventEmitter interface that is molded against the Node.js
	 * EventEmitter interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() { /* Nothing to set */ }
	
	/**
	 * Hold the assigned EventEmitters by name.
	 *
	 * @type {Object}
	 * @private
	 */
	EventEmitter.prototype._events = undefined;
	
	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
	  var events = this._events
	    , names = []
	    , name;
	
	  if (!events) return names;
	
	  for (name in events) {
	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
	  }
	
	  if (Object.getOwnPropertySymbols) {
	    return names.concat(Object.getOwnPropertySymbols(events));
	  }
	
	  return names;
	};
	
	/**
	 * Return a list of assigned event listeners.
	 *
	 * @param {String} event The events that should be listed.
	 * @param {Boolean} exists We only need to know if there are listeners.
	 * @returns {Array|Boolean}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event, exists) {
	  var evt = prefix ? prefix + event : event
	    , available = this._events && this._events[evt];
	
	  if (exists) return !!available;
	  if (!available) return [];
	  if (available.fn) return [available.fn];
	
	  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
	    ee[i] = available[i].fn;
	  }
	
	  return ee;
	};
	
	/**
	 * Emit an event to all registered event listeners.
	 *
	 * @param {String} event The name of the event.
	 * @returns {Boolean} Indication if we've emitted an event.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var evt = prefix ? prefix + event : event;
	
	  if (!this._events || !this._events[evt]) return false;
	
	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;
	
	  if ('function' === typeof listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
	
	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }
	
	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }
	
	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;
	
	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
	
	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }
	
	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }
	
	  return true;
	};
	
	/**
	 * Register a new EventListener for the given event.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} [context=this] The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this)
	    , evt = prefix ? prefix + event : event;
	
	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }
	
	  return this;
	};
	
	/**
	 * Add an EventListener that's only called once.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} [context=this] The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true)
	    , evt = prefix ? prefix + event : event;
	
	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }
	
	  return this;
	};
	
	/**
	 * Remove event listeners.
	 *
	 * @param {String} event The event we want to remove.
	 * @param {Function} fn The listener that we need to find.
	 * @param {Mixed} context Only remove listeners matching this context.
	 * @param {Boolean} once Only remove once listeners.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;
	
	  if (!this._events || !this._events[evt]) return this;
	
	  var listeners = this._events[evt]
	    , events = [];
	
	  if (fn) {
	    if (listeners.fn) {
	      if (
	           listeners.fn !== fn
	        || (once && !listeners.once)
	        || (context && listeners.context !== context)
	      ) {
	        events.push(listeners);
	      }
	    } else {
	      for (var i = 0, length = listeners.length; i < length; i++) {
	        if (
	             listeners[i].fn !== fn
	          || (once && !listeners[i].once)
	          || (context && listeners[i].context !== context)
	        ) {
	          events.push(listeners[i]);
	        }
	      }
	    }
	  }
	
	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) {
	    this._events[evt] = events.length === 1 ? events[0] : events;
	  } else {
	    delete this._events[evt];
	  }
	
	  return this;
	};
	
	/**
	 * Remove all listeners or only the listeners for the specified event.
	 *
	 * @param {String} event The event want to remove all listeners for.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  if (!this._events) return this;
	
	  if (event) delete this._events[prefix ? prefix + event : event];
	  else this._events = prefix ? {} : Object.create(null);
	
	  return this;
	};
	
	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	
	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};
	
	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;
	
	//
	// Expose the module.
	//
	if (true) {
	  module.exports = EventEmitter;
	}


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
	


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	var _Layer2 = __webpack_require__(7);
	
	var _Layer3 = _interopRequireDefault(_Layer2);
	
	var _index = __webpack_require__(8);
	
	var _index2 = _interopRequireDefault(_index);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BasemapLayer = function (_Layer) {
	  _inherits(BasemapLayer, _Layer);
	
	  function BasemapLayer(options) {
	    _classCallCheck(this, BasemapLayer);
	
	    var defaultOptions = {};
	
	    var _options = (0, _extend2.default)({}, defaultOptions, options);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BasemapLayer).call(this, _options));
	
	    _this._setup();
	    return _this;
	  }
	
	  _createClass(BasemapLayer, [{
	    key: '_setup',
	    value: function _setup() {
	      // CartoDB basemap
	      var viziLayer = _vizi2.default.imageTileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
	        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
	      });
	
	      this._setViziLayer(viziLayer);
	    }
	  }]);
	
	  return BasemapLayer;
	}(_Layer3.default);
	
	exports.default = BasemapLayer;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _eventemitter = __webpack_require__(2);
	
	var _eventemitter2 = _interopRequireDefault(_eventemitter);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	 * Base Layer class
	 */
	
	var Layer = function (_EventEmitter) {
	  _inherits(Layer, _EventEmitter);
	
	  function Layer(options) {
	    _classCallCheck(this, Layer);
	
	    // delegate layer
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Layer).call(this));
	
	    _this._viziLayer = null;
	    _this._options = options;
	
	    _this._simultra = null;
	    _this._api = null;
	    return _this;
	  }
	
	  _createClass(Layer, [{
	    key: '_setViziLayer',
	    value: function _setViziLayer(viziLayer) {
	      this._viziLayer = viziLayer;
	    }
	  }, {
	    key: '_getViziLayer',
	    value: function _getViziLayer() {
	      return this._viziLayer;
	    }
	  }, {
	    key: '_getViziWorld',
	    value: function _getViziWorld() {
	      return this._simultra._world;
	    }
	  }, {
	    key: 'addTo',
	    value: function addTo(simultra) {
	      if (this._viziLayer === undefined) {
	        throw new Error('Layer not initialized');
	      }
	      if (simultra._world === undefined) {
	        throw new Error('Simultra not initialized');
	      }
	
	      this._simultra = simultra;
	      this._onAdd(simultra);
	
	      this._viziLayer.addTo(simultra._world);
	
	      return this;
	    }
	  }, {
	    key: '_onAdd',
	    value: function _onAdd(simultra) {
	      this._api = simultra._api;
	    }
	  }, {
	    key: 'remove',
	    value: function remove() {
	      if (this._viziLayer && this._simultra._world) {
	        this._simultra._world.removeLayer(this._viziLayer);
	      }
	
	      this._simultra = null;
	      this._onRemove();
	
	      return this;
	    }
	  }, {
	    key: '_onRemove',
	    value: function _onRemove() {
	      // do something when this layer is removed from simultra
	    }
	  }]);
	
	  return Layer;
	}(_eventemitter2.default);
	
	exports.default = Layer;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _BuildingUtils = __webpack_require__(9);
	
	var _BuildingUtils2 = _interopRequireDefault(_BuildingUtils);
	
	var _FootwayUtils = __webpack_require__(10);
	
	var _FootwayUtils2 = _interopRequireDefault(_FootwayUtils);
	
	var _HighwayUtils = __webpack_require__(11);
	
	var _HighwayUtils2 = _interopRequireDefault(_HighwayUtils);
	
	var _WorkerUtils = __webpack_require__(12);
	
	var _WorkerUtils2 = _interopRequireDefault(_WorkerUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Utility
	 */
	
	
	var Util = {};
	
	Util.BuildingUtils = _BuildingUtils2.default;
	Util.FootwayUtils = _FootwayUtils2.default;
	Util.HighwayUtils = _HighwayUtils2.default;
	Util.WorkerUtils = _WorkerUtils2.default;
	
	exports.default = Util;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Building Utilities
	 */
	
	
	var BuildingUtils = function () {
	
	  /**
	   * Return the style for a specific building
	   *
	   * @param {Object} feature
	   * @param {Object} defaultValue
	   */
	  var style = function style(feature, defaultValue) {
	    var height;
	
	    if (feature.properties.height) {
	      height = feature.properties.height;
	    } else {
	      height = 10 + Math.random() * 10;
	    }
	
	    // construct the style
	    var style = {
	      height: height || defaultValue.height
	    };
	
	    return (0, _extend2.default)({}, defaultValue, style);
	  };
	
	  // return the utility object
	  return {
	    style: style
	  };
	}();
	
	exports.default = BuildingUtils;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Footway Utilities
	 */
	
	
	var FootwayUtils = function () {
	
	  /**
	   * Return the style for a specific footway
	   *
	   * @param {Object} feature
	   * @param {Object} defaultValues
	   */
	  var style = function style(feature, defaultValues) {
	    var style;
	
	    // Polygon
	    if (feature.geometry.type === 'Polygon') {
	      style = {
	        color: '#ecebe9',
	        transparent: true,
	        opacity: 0.2
	      };
	    }
	    // Line
	    else if (feature.geometry.type === 'LineString') {
	        style = {
	          lineColor: '#cad9d4',
	          lineWidth: 1,
	          lineTransparent: true,
	          lineOpacity: 0.2,
	          lineBlending: THREE.AdditiveBlending,
	          lineRenderOrder: 2
	        };
	      }
	      // Point
	      else {
	          style = {
	            pointWidth: 1.0,
	            pointHeight: 1.0,
	            pointColor: '#0000ff'
	          };
	        }
	
	    return (0, _extend2.default)({}, defaultValues, style);
	  };
	
	  // return utility object
	  return {
	    style: style
	  };
	}();
	
	exports.default = FootwayUtils;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// --- constants
	// jscs:disable disallowSpaceAfterObjectKeys
	/**
	 * Highway Utilities
	 */
	var HIGHWAY_COLOR_MAP = {
	  'motorway': '#9e250e', // express way
	  'major': '#f7c616', // main road
	  'primary': '#ffe104', // national highway
	  'secondary': '#ffffff', // sub road
	  'tertiary': '#ffffff', // sub road
	  'residental': '#ffffff', // minor road
	  'living_street': '#ffffff', // minor road
	  'track': '#ffffff', // ?
	  'trunk': '#ffffff', // ?
	  'footway': '#ffffff', // footway
	  'pedestrian': '#f0ebeb' };
	var KIND_COLOR_MAP = {
	  'major_road': '#f7c616',
	  'minor_road': '#ffffff',
	  'highway': '#888785',
	  'path': '#888785',
	  'rail': '#888785'
	};
	var HIGHWAY_WIDTH_MAP = {
	  'motorway': 10, // express way
	  'major': 10, // main road
	  'primary': 10, // national highway
	  'secondary': 7, // sub road
	  'tertiary': 6, // sub road
	  'residental': 5, // minor road
	  'living_street': 4, // minor road
	  'track': 3, // ?
	  'trunk': 3, // ?
	  'footway': 1, // footway
	  'pedestrian': 1 };
	// jscs:enable disallowSpaceAfterObjectKeys
	// ---
	
	var HighwayUtils = function () {
	
	  /**
	   * Return the style for a specific highway
	   *
	   * @param {Object} feature
	   */
	  var style = function style(feature, defaultValue) {
	    var color;
	
	    // ---- color
	    // based on 'highway' property
	    if (feature.properties.highway) {
	      if (feature.properties.highway in HIGHWAY_COLOR_MAP) {
	        color = HIGHWAY_COLOR_MAP[feature.properties.highway];
	      } else {
	        // unknown highway
	        console.info('Unknown highway: ' + feature.properties.highway);
	      }
	    }
	    // based on 'kind' property
	    else if (feature.properties.kind) {
	        if (feature.properties.kind in KIND_COLOR_MAP) {
	          color = KIND_COLOR_MAP[feature.properties.kind];
	        } else {
	          // unknown highway kind
	          console.info('Unknown highway kind: ' + feature.properties.kind);
	        }
	      }
	    // ---
	
	    // construct the style
	    var style = {
	      color: color || defaultValue.color
	    };
	
	    return (0, _extend2.default)({}, defaultValue, style);
	  };
	
	  /**
	   * Return the line width for a specific highway
	   *
	   * @param {Object} feature
	   */
	  var lineWidth = function lineWidth(feature, defaultValue) {
	    var lineWidth;
	    // look for the line weight in the property
	    if (feature.properties.width) {
	      lineWidth = feature.properties.width;
	    }
	    // guess lineWidth from the highway type
	    else if (feature.properties.highway) {
	        if (feature.properties.highway in HIGHWAY_WIDTH_MAP) {
	          lineWidth = HIGHWAY_WIDTH_MAP[feature.properties.highway];
	        } else {
	          // unknown highway type
	          console.info('Unknown highway: ' + feature.properties.highway);
	          lineWidth = defaultValue;
	        }
	      }
	      // no way to find out the width
	      else {
	          // no highway type mentioned
	          lineWidth = defaultValue;
	        }
	    return lineWidth;
	  };
	
	  /**
	   * Convert LineString to Polygon
	   *
	   * @param {Object} world VIZI.World object
	   * @param {Array} coords LineString, e.g. [[lon, lat], [lon, lat], ...]
	   * @param {Number} lineWidth the width of the lines
	   */
	  var lineStringToPolygon = function lineStringToPolygon(world, coords, lineWidth) {
	    return multiLineStringToPolygon(world, [coords], lineWidth);
	  };
	
	  /**
	   * Convert MultiLineString to Polygon
	   *
	   * @param {Object} world VIZI.World object
	   * @param {Array} coordss Array of LineStrings, e.g. [[[lon, lat], [lon, lat], ...], ...]
	   * @param {Number} lineWidth the width of the lines
	   * @returns {Array}
	   */
	  var multiLineStringToPolygon = function multiLineStringToPolygon(world, coordss, lineWidth) {
	    if (lineWidth === undefined) {
	      lineWidth = 1.0;
	    }
	
	    // jscs:disable disallowMultipleVarDecl
	    var cLatLon, pLatLon, nLatLon;
	    var cGeoCoord, pGeoCoord, nGeoCoord;
	    var vVert = new _vizi2.default.Point(),
	        _vVert = new _vizi2.default.Point();
	    var vMean = new _vizi2.default.Point(),
	        vPadding = new _vizi2.default.Point(),
	        _vPadding = new _vizi2.default.Point();
	    var p = new _vizi2.default.Point(),
	        _p;
	    // jscs:enable disallowMultipleVarDecl
	
	    var outCoordss = [];
	
	    coordss.forEach(function (coords) {
	      var outCoords = [];
	
	      cLatLon = pLatLon = nLatLon = null;
	      cGeoCoord = pGeoCoord = nGeoCoord = null;
	
	      for (var i = 0; i < coords.length; i++) {
	        cLatLon = nLatLon || new _vizi2.default.LatLon(coords[i][1], coords[i][0]);
	        cGeoCoord = nGeoCoord || world.latLonToPoint(cLatLon);
	
	        // project the next coordinate
	        if (i < coords.length - 1) {
	          nLatLon = new _vizi2.default.LatLon(coords[i + 1][1], coords[i + 1][0]);
	          nGeoCoord = world.latLonToPoint(nLatLon);
	
	          // calculate the vertical vector
	          vVert.x = -(nGeoCoord.y - cGeoCoord.y);
	          vVert.y = nGeoCoord.x - cGeoCoord.x;
	          normalize(vVert);
	
	          // incorpolate the vertical vector with the previous one
	          if (i == 0) {
	            _vVert.x = vVert.x;_vVert.y = vVert.y;
	          }
	          vMean.x = (vVert.x + _vVert.x) / 2.0;vMean.y = (vVert.y + _vVert.y) / 2.0;
	          normalize(vMean);
	          vPadding.x = vMean.x * lineWidth;vPadding.y = vMean.y * lineWidth;
	        } else {
	          vPadding.x = _vVert.x * lineWidth;vPadding.y = _vVert.y * lineWidth;
	        }
	
	        // construct polygons
	        if (0 < i) {
	          if (i == 1) {
	            // left top
	            p.x = pGeoCoord.x - _vPadding.x;p.y = pGeoCoord.y - _vPadding.y;
	            _p = world.pointToLatLon(p);
	            outCoords.splice(0, 0, [_p.lon, _p.lat]);
	
	            // left bottom
	            p.x = pGeoCoord.x + _vPadding.x;p.y = pGeoCoord.y + _vPadding.y;
	            _p = world.pointToLatLon(p);
	            outCoords.splice(0, 0, [_p.lon, _p.lat]);
	          }
	
	          var idx = outCoords.length / 2;
	          // right bottom
	          p.x = cGeoCoord.x + vPadding.x;p.y = cGeoCoord.y + vPadding.y;
	          _p = world.pointToLatLon(p);
	          outCoords.splice(idx, 0, [_p.lon, _p.lat]);
	
	          // right top
	          p.x = cGeoCoord.x - vPadding.x;p.y = cGeoCoord.y - vPadding.y;
	          _p = world.pointToLatLon(p);
	          outCoords.splice(idx + 1, 0, [_p.lon, _p.lat]);
	        }
	
	        // keep the vectors as the previous one
	        pLatLon = cLatLon;
	        pGeoCoord = cGeoCoord;
	        _vVert.x = vVert.x;_vVert.y = vVert.y;
	        _vPadding.x = vPadding.x;_vPadding.y = vPadding.y;
	      }
	
	      // add the first vertice at the end to make the polygon closed
	      outCoords.push(outCoords[0]);
	
	      // add this polygon to the array of polygons
	      outCoordss.push([outCoords]);
	    });
	
	    return outCoordss;
	  };
	
	  // --- internal helper methods
	  /** Normalize VIZI.Point */
	  function normalize(p) {
	    var l = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
	    l = l === 0.0 ? 1.0 : l;
	    p.x /= l;
	    p.y /= l;
	  }
	  // ---
	
	  // return the utility object
	  return {
	    style: style,
	    lineWidth: lineWidth,
	    lineStringToPolygon: lineStringToPolygon,
	    multiLineStringToPolygon: multiLineStringToPolygon
	  };
	}();
	
	exports.default = HighwayUtils;

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Worker Utils
	 */
	
	var WorkerUtils = function () {
	
	  /** base directory */
	  var base = function () {
	    var current = function () {
	      if (document.currentScript) {
	        return document.currentScript.src;
	      } else {
	        var scripts = document.getElementsByTagName('script');
	        var script = scripts[scripts.length - 1];
	        if (script.src) {
	          return script.src;
	        }
	      }
	    }();
	    if (current) {
	      return dirname(current);
	    }
	  }();
	
	  /** Definition: Worker dependencies */
	  var dependencies = [base + '/simultra-worker.js'];
	
	  /**
	   * Returns worker dependencies
	   *
	   * @returns {string[]}
	   */
	  var getDependencies = function getDependencies() {
	    return dependencies;
	  };
	
	  // --- internal helper methods
	  function basename(path) {
	    return path.replace(/\\/g, '/').replace(/.*\//, '');
	  }
	  function dirname(path) {
	    return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');;
	  }
	  // ---
	
	  // return the utility object
	  return {
	    getDependencies: getDependencies
	  };
	}();
	
	exports.default = WorkerUtils;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	var _Layer2 = __webpack_require__(7);
	
	var _Layer3 = _interopRequireDefault(_Layer2);
	
	var _BuildingUtils = __webpack_require__(9);
	
	var _BuildingUtils2 = _interopRequireDefault(_BuildingUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BuildingLayer = function (_Layer) {
	  _inherits(BuildingLayer, _Layer);
	
	  function BuildingLayer(options) {
	    _classCallCheck(this, BuildingLayer);
	
	    var defaultOptions = {};
	
	    var _options = (0, _extend2.default)({}, defaultOptions, options);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BuildingLayer).call(this, _options));
	
	    _this._setup();
	    return _this;
	  }
	
	  _createClass(BuildingLayer, [{
	    key: '_setup',
	    value: function _setup() {
	
	      // Buildings from Mapzen
	      // var viziLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
	      var viziLayer = _vizi2.default.topoJSONTileLayer('https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
	        interactive: false,
	        maxLOD: 14,
	        style: function style(feature) {
	          return _BuildingUtils2.default.style(feature, {
	            height: 1,
	            lineColor: '#f7c616',
	            lineWidth: 1,
	            lineTransparent: true,
	            lineOpacity: 0.2,
	            lineBlending: THREE.AdditiveBlending,
	            lineRenderOrder: 2
	          });
	        },
	        filter: function filter(feature) {
	          // Don't show points
	          return feature.geometry.type !== 'Point';
	        },
	        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
	      });
	
	      // set the instance properties
	      this._setViziLayer(viziLayer);
	    }
	  }]);
	
	  return BuildingLayer;
	}(_Layer3.default);
	
	exports.default = BuildingLayer;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	var _Layer2 = __webpack_require__(7);
	
	var _Layer3 = _interopRequireDefault(_Layer2);
	
	var _FootwayUtils = __webpack_require__(10);
	
	var _FootwayUtils2 = _interopRequireDefault(_FootwayUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var FootwayLayer = function (_Layer) {
	  _inherits(FootwayLayer, _Layer);
	
	  function FootwayLayer(options) {
	    _classCallCheck(this, FootwayLayer);
	
	    var defaultOptions = {};
	
	    var _options = (0, _extend2.default)({}, defaultOptions, options);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FootwayLayer).call(this, _options));
	
	    _this._setup();
	    return _this;
	  }
	
	  _createClass(FootwayLayer, [{
	    key: '_setup',
	    value: function _setup() {
	
	      var self = this;
	
	      // Landuses from Mapzen
	      // var viziLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/landuse,roads/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
	      var viziLayer = _vizi2.default.topoJSONTileLayer('https://tile.mapzen.com/mapzen/vector/v1/landuse,roads/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
	        interactive: false,
	        maxLOD: 18,
	        style: function style(feature) {
	          if (feature.properties.lanes) {
	            console.log(feature);
	          }
	          if (feature.properties.width) {
	            console.log(feature);
	          }
	
	          return _FootwayUtils2.default.style(feature, {
	            height: 0.5
	          });
	        },
	        filter: function filter(feature) {
	          // Don't show points
	          if (feature.geometry.type === 'Point') {
	            return false;
	          }
	
	          // pedestrian (Polygon)
	          if (feature.properties.kind === 'pedestrian') {
	            return true;
	          }
	
	          // footway (LineString)
	          if (feature.properties.highway === 'footway') {
	            return true;
	          }
	
	          return false;
	        },
	        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
	      });
	
	      // set the instance properties
	      this._setViziLayer(viziLayer);
	    }
	  }]);
	
	  return FootwayLayer;
	}(_Layer3.default);
	
	exports.default = FootwayLayer;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	var _Layer2 = __webpack_require__(7);
	
	var _Layer3 = _interopRequireDefault(_Layer2);
	
	var _HighwayUtils = __webpack_require__(11);
	
	var _HighwayUtils2 = _interopRequireDefault(_HighwayUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var HighwayLayer = function (_Layer) {
	  _inherits(HighwayLayer, _Layer);
	
	  function HighwayLayer(options) {
	    _classCallCheck(this, HighwayLayer);
	
	    var defaultOptions = {};
	
	    var _options = (0, _extend2.default)({}, defaultOptions, options);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HighwayLayer).call(this, _options));
	
	    _this._setup();
	    return _this;
	  }
	
	  _createClass(HighwayLayer, [{
	    key: '_setup',
	    value: function _setup() {
	
	      var self = this;
	
	      // Roads from Mapzen
	      // var viziLayer = VIZI.topoJSONTileLayer('https://vector.mapzen.com/osm/roads/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
	      var viziLayer = _vizi2.default.topoJSONTileLayer('https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?api_key=mapzen-2PvEx4B', {
	        interactive: false,
	        maxLOD: 18,
	        style: function style(feature) {
	          if (feature.properties.lanes) {
	            console.log(feature);
	          }
	          if (feature.properties.width) {
	            console.log(feature);
	          }
	
	          return _HighwayUtils2.default.style(feature, {
	            height: 0,
	            opacity: 0.2
	          });
	        },
	        filter: function filter(feature) {
	          // Don't show points
	          if (feature.geometry.type === 'Point') {
	            return false;
	          }
	
	          // Convert LineString to polygon
	          if (feature.geometry.type === 'LineString') {
	            var lineWidth = _HighwayUtils2.default.lineWidth(feature, 1.0);
	            var outCoordss = _HighwayUtils2.default.lineStringToPolygon(self._getViziWorld(), feature.geometry.coordinates, lineWidth);
	
	            feature.geometry.type = 'MultiPolygon';
	            feature.geometry.coordinates = outCoordss;
	          }
	          // Convert MultiLineString to Polygon
	          else if (feature.geometry.type === 'MultiLineString') {
	              var lineWidth = _HighwayUtils2.default.lineWidth(feature, 1.0);
	              var outCoordss = _HighwayUtils2.default.multiLineStringToPolygon(self._getViziWorld(), feature.geometry.coordinates, lineWidth);
	
	              feature.geometry.type = 'MultiPolygon';
	              feature.geometry.coordinates = outCoordss;
	            }
	
	          return true;
	        },
	        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
	      });
	
	      // set the instance properties
	      this._setViziLayer(viziLayer);
	    }
	  }]);
	
	  return HighwayLayer;
	}(_Layer3.default);
	
	exports.default = HighwayLayer;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	var _Layer2 = __webpack_require__(7);
	
	var _Layer3 = _interopRequireDefault(_Layer2);
	
	var _API = __webpack_require__(17);
	
	var _API2 = _interopRequireDefault(_API);
	
	var _WorkerUtils = __webpack_require__(12);
	
	var _WorkerUtils2 = _interopRequireDefault(_WorkerUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var UPDATE_INTERVAL_MS = 1000;
	
	var PedestrianLayer = function (_Layer) {
	  _inherits(PedestrianLayer, _Layer);
	
	  function PedestrianLayer(options) {
	    _classCallCheck(this, PedestrianLayer);
	
	    var defaultOptions = {
	      renderer: 'cpu'
	    };
	
	    var _options = (0, _extend2.default)({}, defaultOptions, options);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PedestrianLayer).call(this, _options));
	
	    _this._pedestrians = [];
	
	    _this._setup();
	    return _this;
	  }
	
	  _createClass(PedestrianLayer, [{
	    key: '_setup',
	    value: function _setup() {
	
	      // pedestrian layer
	      var viziLayer = _vizi2.default.pedestrianLayer({
	        'monkey': {
	          file: {
	            body: '/javascripts/maps/json/monkey/monkey.json'
	          },
	          scale: 1.0,
	          translation: { x: 0, y: 0, z: 0 },
	          rotation: { x: 0, y: 0, z: 0 }
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
	
	    /**
	     * Starts updating the view
	     */
	
	  }, {
	    key: 'start',
	    value: function start() {
	      this._isRunning = true;
	
	      var self = this;
	
	      // start all of the workers
	      this._pedestrians.forEach(function (pedestrian, id) {
	        if (pedestrian.worker) {
	          pedestrian.worker.start(id, self._createWorkerCallback());
	        }
	      });
	
	      // start pedestrian manager
	      var ws = this._api.wsPedestrians();
	      ws.onclose = function (event) {
	        console.log('closed pedestrian manager');
	      };
	      ws.onmessage = function (event) {
	        self._onMessage(event.data);
	      };
	      ws.onopen = function () {
	        console.log('opened pedestrian manager');
	      };
	      this._ws = ws;
	
	      setTimeout(function () {
	        self._update();
	      }, 0);
	    }
	
	    /**
	     * Stops updating the view
	     */
	
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this._isRunning = false;
	
	      // terminate pedestrian manager
	      if (this._ws) {
	        this._ws.close();
	      }
	
	      // terminate all of the workers
	      this._pedestrians.forEach(function (pedestrian) {
	        if (pedestrian.worker) {
	          pedestrian.worker.stop();
	        }
	      });
	    }
	  }, {
	    key: '_onMessage',
	    value: function _onMessage(data) {
	      var self = this;
	      if (data === 'creation') {
	        setTimeout(function () {
	          self._update();
	        }, 0);
	      } else if (data === 'deletion') {
	        setTImeout(function () {
	          self._update();
	        }, 0);
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
	
	  }, {
	    key: '_update',
	    value: function _update() {
	      var self = this;
	
	      if (this._isRunning) {
	
	        this._lastUpdatedAt = Date.now();
	
	        this._api.getPedestrians().then(function (data) {
	
	          self._performUpdate(data);
	        }).catch(function (err) {
	
	          console.error('Error updating the pedestrian layer:' + err);
	        });
	      }
	    }
	  }, {
	    key: '_performUpdate',
	    value: function _performUpdate(data) {
	      var self = this;
	      var viziLayer = this._getViziLayer();
	
	      // map pedestrian parameters into dictionaries
	      data.forEach(function (pedestrian) {
	        // if pedestrian does not exist
	        if (!self._hasPedestrian(pedestrian)) {
	          // add to pedestrian layer
	          self._addPedestrian(pedestrian);
	        }
	      });
	    }
	  }, {
	    key: '_hasPedestrian',
	    value: function _hasPedestrian(pedestrian) {
	      return pedestrian.id in this._pedestrians;
	    }
	  }, {
	    key: '_addPedestrian',
	    value: function _addPedestrian(pedestrian) {
	      var viziLayer = this._getViziLayer();
	
	      // add pedestrian to the vizi layer
	      var object = viziLayer.addPedestrian(pedestrian.type, new _vizi2.default.LatLon(pedestrian.location.lat, pedestrian.location.lon), pedestrian.angle);
	
	      // create a new updating thread
	      var worker = operative(this._createWorker(), _WorkerUtils2.default.getDependencies());
	
	      // add entry to dictionary
	      var entry = {
	        data: pedestrian,
	        object: object,
	        worker: worker
	      };
	      this._pedestrians[pedestrian.id] = entry;
	
	      // start the worker
	      if (this._isRunning) {
	        worker.start(pedestrian.id, this._createWorkerCallback());
	      }
	
	      console.log('added pedestrian: ' + JSON.stringify(pedestrian));
	      return entry;
	    }
	
	    // (websocket)
	
	  }, {
	    key: '_createWorker',
	    value: function _createWorker() {
	      var baseUrl = this._api.baseUrl;
	      return {
	        _baseUrl: baseUrl,
	        _api: null,
	        _id: null,
	        _callback: null,
	        _isRunning: false,
	
	        /** start updating the pedestrian */
	        start: function start(id, callback) {
	          this._api = new SimWorker.API(this._baseUrl);
	          this._id = id;
	          this._callback = callback;
	          this._isRunning = true;
	
	          var self = this;
	          setTimeout(function () {
	            self._update();
	          }, self._interval);
	        },
	
	        _update: function _update() {
	          var self = this;
	
	          var socket = this._api.wsPedestrian(this._id);
	          socket.onclose = function (event) {
	            self._isRunning = false;
	            console.log('closed pedestrian ' + self._id);
	          };
	          socket.onmessage = function (event) {
	            // here, "event" is an instance of MessageEvent, which cannot be serialized to send to the UI thread,
	            // hence, we just extract the data object (sent by another peer) and transfer it to the UI thread.
	            // console.log(event.data);
	            if (event.data) {
	              self._callback(JSON.parse(event.data));
	            }
	          };
	          socket.onopen = function () {
	            console.log('opened pedestrian ' + self._id);
	          };
	        },
	
	        /** stop updating */
	        stop: function stop() {
	          this._isRunning = false;
	        }
	      };
	    }
	  }, {
	    key: '_createWorkerCallback',
	    value: function _createWorkerCallback() {
	      return function (that) {
	        var prevSender = '';
	        return function (msg) {
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
	      }(this);
	    }
	  }]);
	
	  return PedestrianLayer;
	}(_Layer3.default);
	
	exports.default = PedestrianLayer;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _WebClient2 = __webpack_require__(18);
	
	var _WebClient3 = _interopRequireDefault(_WebClient2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * API Helper
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */
	
	
	// --- API endpoint definitions
	var START_SIMULATION = '/api/v1/start';
	var IS_RUNNING = '/api/v1/isRunning';
	var STOP_SIMULATION = '/api/v1/stop';
	
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
	
	  // --- Controller
	
	
	  _createClass(API, [{
	    key: 'startSimulation',
	    value: function startSimulation(map, type, scenario) {
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
	  }, {
	    key: 'isRunning',
	    value: function isRunning() {
	      return this._ajax({
	        url: this.baseUrl + IS_RUNNING,
	        method: 'get'
	      });
	    }
	  }, {
	    key: 'stopSimulation',
	    value: function stopSimulation() {
	      return this._ajax({
	        url: this.baseUrl + STOP_SIMULATION,
	        method: 'post'
	      });
	    }
	
	    // --- Vehicles
	
	  }, {
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
/* 18 */
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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _vizi = __webpack_require__(1);
	
	var _vizi2 = _interopRequireDefault(_vizi);
	
	var _extend = __webpack_require__(3);
	
	var _extend2 = _interopRequireDefault(_extend);
	
	var _operative = __webpack_require__(20);
	
	var _operative2 = _interopRequireDefault(_operative);
	
	var _Layer2 = __webpack_require__(7);
	
	var _Layer3 = _interopRequireDefault(_Layer2);
	
	var _API = __webpack_require__(17);
	
	var _API2 = _interopRequireDefault(_API);
	
	var _WorkerUtils = __webpack_require__(12);
	
	var _WorkerUtils2 = _interopRequireDefault(_WorkerUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var UPDATE_INTERVAL_MS = 10000;
	
	var VehicleLayer = function (_Layer) {
	  _inherits(VehicleLayer, _Layer);
	
	  function VehicleLayer(options) {
	    _classCallCheck(this, VehicleLayer);
	
	    var defaultOptions = {
	      renderer: 'cpu'
	    };
	
	    var _options = (0, _extend2.default)({}, defaultOptions, options);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VehicleLayer).call(this, _options));
	
	    _this._vehicles = [];
	
	    _this._setup();
	    return _this;
	  }
	
	  _createClass(VehicleLayer, [{
	    key: '_setup',
	    value: function _setup() {
	
	      // car layer
	      var viziLayer = _vizi2.default.vehicleLayer({
	        'veyron': {
	          file: {
	            body: '/javascripts/maps/objs/veyron/parts/veyron_body_bin.js',
	            wheel: '/javascripts/maps/objs/veyron/parts/veyron_wheel_bin.js'
	          },
	          textureFile: '/javascripts/maps/objs/veyron/texture.png',
	          scale: 0.025,
	          translation: { x: 0, y: 0, z: 0 },
	          rotation: { x: 0, y: 90 * Math.PI / 180, z: 0 }
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
	
	    /**
	     * Starts updating the view
	     */
	
	  }, {
	    key: 'start',
	    value: function start() {
	      this._isRunning = true;
	
	      var self = this;
	
	      // start all of the workers
	      this._vehicles.forEach(function (vehicle, id) {
	        if (vehicle.worker) {
	          vehicle.worker.start(id, self._createWorkerCallback());
	        }
	      });
	
	      // start vehicle manager
	      var ws = this._api.wsVehicles();
	      ws.onclose = function (event) {
	        console.log('closed vehicle manager');
	      };
	      ws.onmessage = function (event) {
	        self._onMessage(event.data);
	      };
	      ws.onopen = function () {
	        console.log('opened vehicle manager');
	      };
	      this._ws = ws;
	
	      setTimeout(function () {
	        self._update();
	      }, 0);
	    }
	
	    /**
	     * Stops updating the view
	     */
	
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this._isRunning = false;
	
	      // terminate vehicle manager
	      if (this._ws) {
	        this._ws.close();
	      }
	
	      // terminate all of the workers
	      this._vehicles.forEach(function (vehicle) {
	        if (vehicle.worker) {
	          vehicle.worker.stop();
	        }
	      });
	    }
	  }, {
	    key: '_onMessage',
	    value: function _onMessage(data) {
	      var self = this;
	      if (data === 'creation') {
	        setTimeout(function () {
	          self._update();
	        }, 0);
	      } else if (data === 'deletion') {
	        setTImeout(function () {
	          self._update();
	        }, 0);
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
	    //     this._api.getVehicles()
	    //       .then(function(data) {
	    //
	    //         self._performUpdate(data);
	    //
	    //       }).catch(function(err) {
	    //
	    //       console.error('Error updating the vehicle layer: ' + err);
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
	
	  }, {
	    key: '_update',
	    value: function _update() {
	      var self = this;
	
	      if (this._isRunning) {
	
	        this._lastUpdatedAt = Date.now();
	
	        this._api.getVehicles().then(function (data) {
	
	          self._performUpdate(data);
	        }).catch(function (err) {
	
	          console.error('Error updating the vehicle layer: ' + err);
	        });
	      }
	    }
	  }, {
	    key: '_performUpdate',
	    value: function _performUpdate(data) {
	      var self = this;
	
	      // map vehicle parameters into dictionaries
	      data.forEach(function (vehicle) {
	        // if vehicle does not exist
	        if (!self._hasVehicle(vehicle)) {
	          // add to vehicle layer
	          self._addVehicle(vehicle);
	        }
	      });
	    }
	  }, {
	    key: '_hasVehicle',
	    value: function _hasVehicle(vehicle) {
	      return vehicle.id in this._vehicles;
	    }
	  }, {
	    key: '_addVehicle',
	    value: function _addVehicle(vehicle) {
	      var viziLayer = this._getViziLayer();
	
	      // add vehicle to the vizi layer
	      var object = viziLayer.addVehicle(vehicle.type, new _vizi2.default.LatLon(vehicle.location.lat, vehicle.location.lon), vehicle.angle);
	
	      // create a new updating thread
	      var worker = (0, _operative2.default)(this._createWorker(), _WorkerUtils2.default.getDependencies());
	
	      // add entry to dictionary
	      var entry = {
	        data: vehicle,
	        object: object,
	        worker: worker
	      };
	      // this._vehicles[vehicle.id] = entry;
	      this._vehicles.push(entry);
	
	      // start the worker
	      if (this._isRunning) {
	        worker.start(vehicle.id, this._createWorkerCallback());
	      }
	
	      console.log('added vehicle: ' + JSON.stringify(vehicle));
	      return entry;
	    }
	
	    // (rest)
	    // _createWorker() {
	    //   var baseUrl = this._api.baseUrl;
	    //   return {
	    //     _interval: 10,
	    //     _baseUrl: baseUrl,
	    //     _api: null,
	    //     _id: null,
	    //     _callback: null,
	    //     _isRunning: false,
	    //
	    //     /** start updating the vehicle */
	    //     start: function(id, callback) {
	    //       this._api = new SimWorker.API(this._baseUrl);
	    //       this._id = id;
	    //       this._callback = callback;
	    //       this._isRunning = true;
	    //
	    //       var self = this;
	    //       setTimeout(function() { self._update(); }, self._interval);
	    //     },
	    //
	    //     _update: function() {
	    //       var id = this._id;
	    //       var self = this;
	    //       this._api.getVehicle(id)
	    //         .then(function(data) {
	    //           self._callback(data);
	    //         })
	    //         .catch(function(err) {
	    //           console.error(err);
	    //         })
	    //         .then(function() {
	    //           if (self._isRunning) {
	    //             setTimeout(function() { self._update(); }, self._interval);
	    //           }
	    //         });
	    //     },
	    //
	    //     /** stop updating */
	    //     stop: function() {
	    //       this._isRunning = false;
	    //     }
	    //   };
	    // }
	
	    // (websocket)
	
	  }, {
	    key: '_createWorker',
	    value: function _createWorker() {
	      var baseUrl = this._api.baseUrl;
	      return {
	        _baseUrl: baseUrl,
	        _api: null,
	        _id: null,
	        _socket: null,
	        _callback: null,
	        _isRunning: false,
	
	        /** start updating the vehicle */
	        start: function start(id, callback) {
	          this._api = new SimWorker.API(this._baseUrl);
	          this._id = id;
	          this._callback = callback;
	          this._isRunning = true;
	
	          var self = this;
	          setTimeout(function () {
	            self._update();
	          }, 0);
	        },
	
	        _update: function _update() {
	          var self = this;
	
	          var socket = this._api.wsVehicle(this._id);
	          socket.onclose = function (event) {
	            self._isRunning = false;
	            console.log('closed vehicle ' + self._id);
	          };
	          socket.onmessage = function (event) {
	            // here, "event" is an instance of MessageEvent, which cannot be serialized to send to the UI thread,
	            // hence, we just extract the data object (sent by another peer) and transfer it to the UI thread.
	            // console.log(event.data);
	            if (event.data) {
	              self._callback(JSON.parse(event.data));
	            }
	          };
	          socket.onopen = function () {
	            console.log('opened vehicle ' + self._id);
	          };
	          self._socket = socket;
	        },
	
	        /** stop updating */
	        stop: function stop() {
	          this._isRunning = false;
	        }
	      };
	    }
	  }, {
	    key: '_createWorkerCallback',
	    value: function _createWorkerCallback() {
	      return function (that) {
	        var prevSender = '';
	
	        // ---
	        // // save two locations l_(t-1) and l_(t) for the angle calculation
	        // var coords = [VIZI.point(0, 0), VIZI.point(0, 0)];
	        // var latLon = VIZI.latLon(0, 0);
	        // var refVec = new THREE.Vector2(1, 0);
	        // var traceVec = new THREE.Vector2(0, 0);
	        // ---
	
	        return function (msg) {
	          var sender = msg.sender;
	          var vehicle = msg.data;
	
	          var viziLayer = that._getViziLayer();
	
	          // update the object location in simultra
	          if (vehicle.id in that._vehicles) {
	            that._vehicles[vehicle.id].data = vehicle;
	          }
	
	          // // calculate the point in the world coordinate
	          // latLon.lat = vehicle.location.lat;
	          // latLon.lon = vehicle.location.lon;
	          // var point = that._getViziWorld().latLonToPoint(latLon);
	          // coords[0] = coords[1];
	          // coords[1] = point;
	          // console.log('vehicle ' + vehicle.id + ': coords = ' + JSON.stringify(coords));
	          //
	          // // calculate the angle
	          // traceVec.subVectors(coords[1], coords[0]);
	          // var cos = traceVec.dot(refVec) / (traceVec.length() * refVec.length());
	          // var angle = Math.acos(cos);
	          // console.log('vehicle ' + vehicle.id + ': cos = ' + cos + ', angle = ' + angle);
	          var angle = vehicle.angle * Math.PI / 180.;
	          angle += -90 * Math.PI / 180.; // TODO: temporary fix, adding -90 degrees to the original angle!!
	
	          // update the object in vizi layer
	          if (prevSender !== sender) {
	            viziLayer.setLabelClass(vehicle.id, 'label vehicle');
	            viziLayer.setLabelText(vehicle.id, sender);
	            prevSender = sender;
	          }
	          // viziLayer.setLocation(vehicle.id, vehicle.location.lat, vehicle.location.lon, -vehicle.angle);
	          viziLayer.setLocation(vehicle.id, vehicle.location.lat, vehicle.location.lon, -angle);
	          viziLayer.setVelocity(vehicle.id, vehicle.velocity, 0, 0, vehicle.wheel);
	        };
	      }(this);
	    }
	
	    /**
	     * Returns the centroid of vehicles
	     */
	
	  }, {
	    key: 'getCentroid',
	    value: function getCentroid() {
	      if (this._vehicles.length > 0) {
	        // FIXME: calculate the centroid of all vehicles
	        // var location = this._vehicles[0].object.latlon;
	        if (this._vehicles[0].object.vehicle && this._vehicles[0].object.vehicle.root) {
	          var position = this._vehicles[0].object.vehicle.root.position;
	          var point = new _vizi2.default.Point(position.x, position.z);
	          var latLon = this._getViziWorld().pointToLatLon(point);
	          return latLon; // {lat: 35.xxx, lon: 140.xxx}
	        } else {
	          return null;
	        }
	      } else {
	        return null;
	      }
	    }
	  }]);
	
	  return VehicleLayer;
	}(_Layer3.default);
	
	exports.default = VehicleLayer;

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_20__;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=simultra.js.map