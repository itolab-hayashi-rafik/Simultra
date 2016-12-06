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
	L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


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
		this._log = new Log(files[0]);
		this._handleLogChange();
	}
};

Visualizer.prototype._handleLogChange = function() {
	// FIXME: implement this
	console.log('handle');
};

Visualizer.prototype._handleSlide = function(event, ui) {
	// FIXME: implement this
	var value = ui.value;
	console.log('(slide) value = ' + value);
};


/**
 * Log
 **/
function Log(file) {
	if (window.FileReader == undefined) {
		throw Error("HTML5 FileReader is not available.");
	}

	// properties
	this._reader = null;
}

Log.prototype._init = function() {
	this._reader = new FileReader();
	this._reader.onload = (function(self) {
		return function(event) {
			self._handleOnLoad(event);
		};
	})(this);
	this._reader.readAsDataURL(file);
};

Log.prototype._handleOnLoad = function(event) {
	// FIXME: implement this
	console.log(event);
};

Log.prototype.play = function() {
	// FIXME: implement this
};

Log.prototype.stop = function() {
	// FIXME: implement this
};

// onload function
$(function() {
	var visualizer = new Visualizer();
	window.visualizer = visualizer;
});