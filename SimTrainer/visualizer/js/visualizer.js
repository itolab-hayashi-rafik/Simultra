/** 
 * Visualizer
 **/
function Visualizer() {
	// properties
	this._map = null;
	this._mapContainer = null;
	this._slider = null;
	this._log = null;

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
	// FIXME: implement this
	console.log(event);
	if (event.dataTransfer) {
		var files = event.dataTransfer.files;
		if (files.length > 1) {
			throw Error("More than one file are dropped. This operation is unsupported!!");
		}
		this._log = new Log(
			files[0], 
			(function(self) { return function(log){ self._handleLogReady(log); } })(this),
			(function(self) { return function(index, data){ self._handleLogProgress(index, data); } })(this)
			);
		this._handleLogChange();
	}
};

Visualizer.prototype._handleLogChange = function() {
	// FIXME: implement this
	console.log('handleLogChange');
};

Visualizer.prototype._handleLogReady = function(log) {
	// FIXME: implement this
	console.log('handleLogReady');
	var range = log.getIndexRange();
	var index = log.getIndex();
	$(this._slider).slider({
		value: index,
		min: range[0],
		max: range[1],
		step: 1
	});
};

Visualizer.prototype._handleLogProgress = function(index, data) {
	// FIXME: implement this
	console.log('handleLogProgress');
	$(this._slider).slider({
		value: index
	});
};

Visualizer.prototype._handleLogPlayClick = function() {
	if (this._log) {
		this._log.play();
	}
};

Visualizer.prototype._handleLogStopClick = function() {
	if (this._log) {
		this._log.stop();
	}
};

Visualizer.prototype._handleSlide = function(event, ui) {
	// FIXME: implement this
	var value = ui.value;
	console.log('(slide) value = ' + value);
	if (this._log) {
		this._log.setIndex(value);
	}
};


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
		this._onLoadComplete(this);
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
	}
}

Log.prototype.play = function() {
	this.stop();
	this._pendNext();
};

Log.prototype._onNext = function(data) {
	// FIXME: implement this
	console.log(data);
	if (this._onProgress) {
		this._onProgress(this._idx, data);
	}

	// iterate
	this._idx++;
	this._pendNext();
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