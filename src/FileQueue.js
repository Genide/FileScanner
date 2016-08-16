var chokidar = require('chokidar');
var timer = 1000 * 60; // A minute

var FileQueue = function (folderPath, maxRequestsPerMin) {
	this.currentRequests = [];
	this.queue = [];
	this.maxRequestsPerMin = maxRequestsPerMin;
	this.folderPath = folderPath;
	var that = this; //Created for context handling

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
	// Use arrow notation to bind 'this'
	this.handleNewFile = (filepath, stats) => {
		console.log(filepath + " needs to be scanned");
		this.queue.push(filepath);
	};
};

FileQueue.prototype = {
	currentRequests: null,
	maxRequestsPerMin: null,
	folderPath: null,
	watcher: null,
	// This function watches a single folderPath
	// TODO: Add arguments to specify whether to watch files recursively
	startWatch: function () {
		this.watcher = chokidar.watch(this.folderPath);

		this.watcher.on('add', this.handleNewFile);
		// this.watcher.on('change', this.handleNewFile);
	},
	onResult: function () {

	},
	performOperation: function (callback) {
		// Determine amount of requests still in process
		var newRequestAmount = this.maxRequestsPerMin  -this.currentRequests.length;
		for (var i = 0; i < newRequestAmount; i++){
			if (this.queue.length > 0) {
				this.currentRequests.push(this.queue.shift());
			}
		}
		// TODO: Use async to map over results from requests
	}
};

var fileQueue = new FileQueue('.', 4);
fileQueue.startWatch();
