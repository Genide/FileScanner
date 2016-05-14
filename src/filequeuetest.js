'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const async = require('async');
var chokidar = require('chokidar');
var VirusTotal = require('./index.js');

class FileQueue {
	constructor() {
		// Create the file watcher
		this.watcher = chokidar.watch('');
		this.setupWatcher();

		// Create the rest of the properties
		this.queue = [];
		// this.watchedFiles = [];
		this.processing = [];
		this.processingCount = 0;
		this.processed = [];
		this.maxRequests = 4;
		this.interval = 10 * 1000;
		this.refreshIntervalID = null;
		this.vtObj = new VirusTotal('apikey');
	}

	setupWatcher () {
		this.watcher.on('add', (path, stats) => {
			console.log('Add: ' + path);
			// console.log(stats);
			this.queueFile(path);
			//console.log(this.watcher._watched);
		});
		
		this.watcher.on('change', (path, stats) => {
			console.log('Change: ' + path);
			// console.log(stats);
			this.queueFile(path);
		});

		this.watcher.on('unlink', (path, stats) => {
			// TODO: figure out what to do if the file is being processed
			console.log('Unlink: ' + path);
			this.dequeueFile(path);
		});
	}

	getWatchedFiles () { return this.watcher.getWatched(); }
	getQueuedFiles () { return this.queue; }
	getProcessingFiles () { return this.processing; }
	getProcessedFiles () { return this.processed; }

	watchFiles (files) {
		// TODO: Refactor these lines into their own function
		var filesStr = files.map((val) => val.toString());
		var formattedFileStr = filesStr.map((filepath) => {
			return filepath.split('/').join(path.sep);
		});
		this.watcher.add(formattedFileStr);

	}

	unwatchFiles (files) {
		// TODO: Refactor these lines into their own function
		var filesStr = files.map((val) => val.toString());
		var formattedFileStr = filesStr.map((filepath) => {
			return filepath.split('/').join(path.sep);
		});
		this.watcher.unwatch(formattedFileStr);
		formattedFileStr.forEach(this.dequeueFile.bind(this));
	}

	queueFile (file) {
		// push file if file is not queued
		// if (_.indexOf(this.queue, file) === -1) {
		if (!this.queue.includes(file)) {
			this.queue.push(file);
		}
	}

	dequeueFile (file) {
		var index = this.queue.indexOf(file);
		if (index >= 0) {
			this.queue.splice(index, 1);
		}
	}

	// Move files from queue to processing
	// Move processing files to processed. Replace duplicate results
	processNextFiles () {
		console.log('processing');
		//this.processed = _.concat(this.processed, this.processing);
		this.processing = [];
		this.processingCount = 0;
		for (var i = 0; i < this.maxRequests; i++) {
			if (this.queue.length > 0) {
				this.processing.push(this.queue.shift());
				this.processingCount++;
			}
		}
		// TODO: Rework this entire area
		var getHashes = function (callback) {
			async.map(this.processing, this.vtObj.hashFile, (err, result) => {
				callback(err, result);
			});
		};
		var getFileScanReports = function (hashes, callback) {
			async.map(hashes, this.vtObj.getFileScanReport, (err, result) => {
				callback(err, result);
			});
		};
		var sendForScanning = function (reports, callback) {
			var scanFile = function (report, cb) {
				if (report.response_code === 1) {
					cb(null, report);
				} else {
					var index = _.indexOf(reports, report);
					this.vtObj.scanFile(this.processing[index], cb);
				}
			};
			async.map(reports, scanFile.bind(this), callback);
		};
		// TODO: Separate successful reports from files that need to be scanned
		var handleResults = function (err, result) {
			for (var i = 0; i < this.processing.length; i++) {
				this.processed[this.processing[i]] = result[i];
			}
		};

		async.waterfall([
			getHashes.bind(this),
			getFileScanReports.bind(this),
			sendForScanning.bind(this)
		], handleResults.bind(this));
		// console.log("processing next batch of " + this.processingCount++);
	}

	startWatch () {
		if (this.refreshIntervalID === null || 
			this.refreshIntervalID._idleTimeout === -1) {
			// http://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-context-inside-a-callback
			this.refreshIntervalID = setInterval(this.processNextFiles.bind(this), this.interval);
			this.setupWatcher();
		} else {
			console.log('The watch has already begun');
		}
	}

	stopWatch () {
		clearInterval(this.refreshIntervalID);
		// console.log(this.refreshIntervalID);
		this.watcher.close();
	}
}

module.exports = FileQueue;