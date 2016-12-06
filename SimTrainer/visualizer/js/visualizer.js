/** 
 * Visualizer
 **/
function Visualizer() {
	// properties
	this._map = null;
	this._mapContainer = null;
	this._slider = null;
	this._tracers = null;

	// initialize a visualizer
	this._init();
}

Visualizer.prototype._init = function() {
	// initialize map object with view
	var map = L.map('map', {
		zoomControl: false,
		center: L.latLng(35.156327, 136.923229),
		zoom: 12
	});
	this._map = map;
	this._mapContainer = document.getElementById('map');

	// add control
	L.control.zoom({ position: "topright" }).addTo(map);
	// add tile layer
	// L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
	L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png').addTo(map);


	// drag-and-drop
	this._mapContainer.addEventListener('dragover', (function(self){
		return function(e) {
			self._handleDragOver(e);
		};
	})(this), false);
	this._mapContainer.addEventListener('drop', (function(self) {
		return function(e) {
			self._handleDropFile(e);
		};
	})(this), false);

	// control
	var btnLogPlay = document.getElementById('btn-log-play');
	btnLogPlay.addEventListener('click', (function(self) {
		return function(e) {
			self._handleLogPlayClick();
		};
	})(this), false)
	var btnLogStop = document.getElementById('btn-log-stop');
	btnLogStop.addEventListener('click', (function(self) {
		return function(e) {
			self._handleLogStopClick();
		};
	})(this), false)

	// slider
	this._slider = document.getElementById('slider');
	$(this._slider).slider({
		value: 0,
		min: 0,
		max: 100,
		step: 1,
		slide: (function(self) { return function(event, ui){ self._handleSlide(event, ui); } })(this)
	});

	// tracer
	this._tracers = [];
};

Visualizer.prototype._handleDragOver = function(event) {
	console.log('dragover: ' + JSON.stringify(event));
	event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
};

Visualizer.prototype._handleDropFile = function(event) {
    event.stopPropagation();
    event.preventDefault();

	if (event.dataTransfer) {
		var files = event.dataTransfer.files;
		if (files.length > 1) {
			throw Error("More than one file are dropped. This operation is unsupported!!");
		}
		var tracer = new Tracer(
			this._map,
			files[0],
			(function(self) { return function(tracer) { self._handleTracerReady(tracer); }; })(this),
			(function(self) { return function(tracer, index) { self._handleTracerProgress(tracer, index); }; })(this)
		);
		this._tracers.push(tracer);
		this._handleAddTracer();
	}
};

Visualizer.prototype._handleAddTracer = function() {
	// FIXME: implement this
	console.log('_handleAddTracer');
};

Visualizer.prototype._handleTracerReady = function(tracer) {
	var range = tracer.getIndexRange();
	var index = tracer.getIndex();
	$(this._slider).slider({
		value: index,
		min: range[0],
		max: range[1],
		step: 1
	});
};

Visualizer.prototype._handleTracerProgress = function(tracer, index) {
	$(this._slider).slider({
		value: index
	});
};

Visualizer.prototype._handleLogPlayClick = function() {
	if (this._tracers[0]) { // FIXME: support multiple tracers
		this._tracers[0].play();
	}
};

Visualizer.prototype._handleLogStopClick = function() {
	if (this._tracers[0]) { // FIXME: support multiple tracers
		this._tracers[0].stop();
	}
};

Visualizer.prototype._handleSlide = function(event, ui) {
	var value = ui.value;
	console.log('(slide) value = ' + value);
	if (this._tracers[0]) { // FIXME: support multiple tracers
		this._tracers[0].setIndex(value);
	}
};


// ========================================================================================================


/**
 * Tracer
 */
function Tracer(map, logfile, onLoadCallback = null, onUpdateCallback = null) {
	// properties
	this._map = map;
	this._log = null;
	this._latlngs = null;
	this._angles = null;
	this._polyline = null;
	this._marker = null;

	this._onLoadCallback = onLoadCallback || function(tracer){};
	this._onUpdateCallback = onUpdateCallback || function(tracer, index){};

	this._init(logfile);
};

Tracer.prototype._init = function(logfile) {
	this._log = new Log(
		logfile,
		(function(self) { return function(log, wholeData){ self._onLoad(log, wholeData); } })(this),
		(function(self) { return function(index, data){ self._onUpdate(index, data); } })(this)
	);
};

Tracer.prototype._onLoad = function(log, data) {
	// Payload:
	// [{
	// 	timestamp: 1471100278158,
	// 	data: {
	// 		sender: "iphone",
	// 		data: {
	// 			id: "0",
	// 			type: "veyron",
	// 			location: {
	// 				lat: 35.12852048504644,
	// 				lon: 136.9564512838954
	// 			},
	// 			angle: 3.936344904000036,
	// 			velocity: 0,
	// 			wheel: 0
	// 		}
	// 	}
	// }, ...]

	// draw a polyline on the entire trip
	this._latlngs = data.map(function(e) { return L.latLng(e.data.data.location.lat, e.data.data.location.lon); });
	this._angles = data.map(function(e) { return (e.data.data.angle * 180 / Math.PI); });
	this._polyline = L.polyline(this._latlngs, {color: 'skyblue'}).addTo(this._map);
	this._map.fitBounds(this._polyline.getBounds());

	// draw a marker at the current latlon
	var index = this._log.getIndex();
	var latlng = this._latlngs[index];
	var angle = this._angles[index];
	this._marker = L.marker(latlng, {
		icon: L.icon({
			iconUrl: 'img/car.png',
			iconRetinaUrl: 'img/car@2x.png',
			iconSize: [50, 50],
			iconAnchor: [25, 25]
		}),
		rotationAngle: angle,
		rotationOrigin: 'center'
	}).addTo(this._map);

	// onLoad callback
	if (this._onLoadCallback) {
		this._onLoadCallback(this);
	}
};

Tracer.prototype._onUpdate = function(index, data) {
	// Payload:
	// {
	// 	timestamp: 1471100278158,
	// 	data: {
	// 		sender: "iphone",
	// 		data: {
	// 			id: "0",
	// 			type: "veyron",
	// 			location: {
	// 				lat: 35.12852048504644,
	// 				lon: 136.9564512838954
	// 			},
	// 			angle: 3.936344904000036,
	// 			velocity: 0,
	// 			wheel: 0
	// 		}
	// 	}
	// }

	// update the marker
	var latlng = this._latlngs[index];
	var angle = this._angles[index];
	this._marker.setLatLng(latlng);
	this._marker.setRotationAngle(angle);

	// onUpdate callback
	if (this._onUpdateCallback) {
		this._onUpdateCallback(this, index);
	}
};

Tracer.prototype.getIndexRange = function() {
	return this._log.getIndexRange();
};

Tracer.prototype.getIndex = function() {
	return this._log.getIndex();
};

Tracer.prototype.setIndex = function(index) {
	this._log.setIndex(index);
};

Tracer.prototype.play = function() {
	this._log.play();
};

Tracer.prototype.stop = function() {
	this._log.stop();
};


// ========================================================================================================


/**
 * Log
 **/
function Log(file, onLoadComplete = null, onProgress = null) {
	// properties
	this._reader = null;
	this._rawdata = null;
	this._data = null;
	this._idx = -1;
	this._minIdx = null;
	this._maxIdx = null;
	this._referenceTime = null;
	this._timerId = null;
	this._speed = 1;

	this._onLoadComplete = onLoadComplete || function(log){};
	this._onProgress = onProgress || function(idx, data){};

	this._init(file);
}

Log.prototype._init = function(file) {
	console.log('(log) init with file');
	console.log(file);

	// setup
	this._reader = new FileReader();
	this._reader.onload = (function(self) {
		return function(event) {
			self._handleOnLoad(event);
		};
	})(this);

	// assert
	if (("" + file.type).indexOf("image/") == 0 ||
		("" + file.type).indexOf("video/") == 0 ||
		("" + file.type).indexOf("audio/") == 0) {
		throw Error("File must be text format!! Given file type = " + file.type);
	}

	// load
	this._reader.readAsText(file);
};

Log.prototype._handleOnLoad = function(event) {
	if (event.target.result == undefined) {
		throw Error("Could not read the file as text.");
	}
	this._rawdata = event.target.result;
	this._handleParseData();
};

Log.prototype._handleParseData = function() {
	// parse raw data
	this._data = this._rawdata
				.split("\n")
				.filter(function (v) { return (v !== ""); })
				.map(function(line) { return JSON.parse(line); });

	this._idx = 0;
	this._minIdx = 0;
	this._maxIdx = this._data.length - 1;

	// Payload:
	// [{
	// 	timestamp: 1471100278158,
	// 	data: {
	// 		sender: "iphone",
	// 		data: {
	// 			id: "0",
	// 			type: "veyron",
	// 			location: {
	// 				lat: 35.12852048504644,
	// 				lon: 136.9564512838954
	// 			},
	// 			angle: 3.936344904000036,
	// 			velocity: 0,
	// 			wheel: 0
	// 		}
	// 	}
	// }, ...]

	this._handleOnLoadComplete();
};

Log.prototype._handleOnLoadComplete = function() {
	if (this._onLoadComplete) {
		this._onLoadComplete(this, this._data);
	}
};

Log.prototype.getIndexRange = function() {
	return [this._minIdx, this._maxIdx];
};

Log.prototype.getIndex = function() {
	return this._idx;
}

Log.prototype.setIndex = function(index) {
	if (this._timerId) {
		this.stop();
		this._idx = Math.max(this._minIdx, Math.min(index, this._maxIdx));
		this.play();
	} else {
		this._idx = Math.max(this._minIdx, Math.min(index, this._maxIdx));
		this._onNext(this._data[this._indx], false);	
	}
}

Log.prototype.play = function() {
	this.stop();
	this._pendNext();
};

Log.prototype._onNext = function(data, proceed = true) {
	// FIXME: implement this
	console.log(data);
	if (this._onProgress) {
		this._onProgress(this._idx, data);
	}

	// iterate
	if (proceed) {
		this._idx++;
		this._pendNext();
	}
};

Log.prototype._pendNext = function() {
	var idx = this._idx + 1;
	if (idx < this._data.length - 1) {
		var data = this._data[idx];
		var timestamp = data.timestamp;

		var delta = this._referenceTime ? timestamp - this._referenceTime : 0;
	    this._referenceTime = timestamp;
	    this._timerId = setTimeout((function(self) {
	    	return function() {
	    		self._onNext(data);
	    	};
	    })(this), delta / this._speed);
	}
};

Log.prototype.stop = function() {
	if (this._timerId) {
		clearTimeout(this._timerId);
		this._timerId = null;
		this._referenceTime = null;
	}
};


// ========================================================================================================


// onload function
$(function() {
	// assertion
	if (window.FileReader == undefined) {
		throw Error("HTML5 FileReader is not available.");
	}

	// instantiate
	var visualizer = new Visualizer();
	window.visualizer = visualizer;
});