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
		this._isSetup = false;
		this.setupWatcher();
		this._watching = false;

		// Create the rest of the properties
		this.queue = [];
		this.nextIntervalQueue = [];
		// this.watchedFiles = [];
		this.processingCount = 0;
		this.processed = [];
		this.maxRequests = 4;
		this.interval = 60 * 1000;
		this.refreshIntervalID = null;
		this.vtObj = new VirusTotal('62b0c389e1d05404efb1c13ab88da12e2d100783b8384267fb020a159b358b62');
	}

	setupWatcher () {
		if (this._isSetup === true) return;
		this.watcher.on('add', (path, stats) => {
			console.log('Add: ' + path);
			// console.log(stats);
			this.queueFile(path, 'new');
		});

		this.watcher.on('change', (path, stats) => {
			console.log('Change: ' + path);
			// console.log(stats);
			this.queueFile(path, 'new');
		});

		this.watcher.on('unlink', (path, stats) => {
			// TODO: figure out what to do if the file is being processed
			console.log('Unlink: ' + path);
			this.dequeueFile(path);
		});
		this._isSetup = true;
	}

	getWatchedFiles () { return this.watcher.getWatched(); }
	getQueuedFiles () { return this.queue; }
	getNextIntervalQueuedFiles () { return this.nextIntervalQueue; }
	getProcessedFiles () { return this.processed; }
	getProcessingCount () {return this.processingCount;}

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

	queueFile (file, status) {
		// push file if file is not queued
		var fileObj = {
			"filepath": file,
			"status": status
		};

		if (this._watching &&
			(this.processingCount < this.maxRequests) &&
			(fileObj.status !== "reporting")) {
			this.processFile(fileObj);
		} else {
			switch (fileObj.status) {
				case "new":
					// Remove from nextIntervalQueue
					// TODO: Actually remove from nextIntervalQueue. it currently doesn't work
					var searchObj = {
						"filepath": file
					};
					_.pullAllBy(this.nextIntervalQueue, [searchObj], "filepath");
					// Remove from queue if status is anything other than new
					var foundObj = _.find(this.queue, searchObj);
					if (foundObj) {
						if (foundObj.status !== "new"){
							_.pullAllBy(this.queue, [searchObj], "filepath");
							this.queue.push(fileObj);
						}
					} else {
						this.queue.push(fileObj);
					}
					break;
				case "scanning":
					this.queue.push(fileObj);
					break;
				case "reporting":
					this.nextIntervalQueue.push(fileObj);
					break;
			}
		}
	}

	queueNextIntervalFile (file, status) {
		var fileObj = {
			"filepath": file,
			"status": status
		};

		// TODO: Identify cases
		this.nextIntervalQueue.push(fileObj);
	}

	dequeueFile (file) {
		var searchObj = {
			"filepath": file
		};
		_.pullAllBy(this.queue, [searchObj], 'filepath');
		_.pullAllBy(this.nextIntervalQueue, [searchObj], 'filepath');
	}

	shiftQueue () {
		if (this.nextIntervalQueue.length > 0) {
			return this.nextIntervalQueue.shift();
		} else {
			return this.queue.shift();
		}
	}

	handleWork (file, callback) {
		switch (file.status) {
			case 'new':
			case 'reporting':
				console.log(file.filepath);
				async.waterfall([
					function (cb) {
						cb(null, file.filepath);
					},
					this.vtObj.hashFile.bind(this.vtObj),
					this.vtObj.getFileScanReport.bind(this.vtObj)
				], callback);
				break;
			case 'scanning':
				this.vtObj.scanFile(file.filepath, callback);
				break;
			default:
				callback (new Error('Unexpected file.action: ' + file.action));
		}
	}

	handleResult (fileObj, result) {
		switch (fileObj.status) {
			case 'new':
				if (result.response_code === 1) {
					this.processed[fileObj.filepath] = result;
				} else {
					this.queueFile(fileObj.filepath, 'scanning');
				}
				break;
			case 'scanning':
				if (result.response_code === 1) {
					this.queueFile(fileObj.filepath, 'reporting');
				}
				break;
			case 'reporting':
				if (result.response_code === 1) {
					this.processed[fileObj.filepath] = result;
				} else {
					this.queueFile(fileObj.filepath, 'reporting');
				}
				break;
		}
	}

	// Processes only one fileObj
	processFile (fileObj) {
		if (this.processingCount >= this.maxRequests) {
			throw new Error('Too many processed');
		} else {
			this.processingCount++;
			var callback = function (err, result) {
				if (err) {
					console.log(err.message);
					this.queueNextIntervalFile(fileObj.filepath, fileObj.status);
				} else {
					this.handleResult(fileObj, result);
				}
			};
			this.handleWork(fileObj, callback.bind(this));
		}
	}

	// Move files from queue to processing
	// Move processing files to processed. Replace duplicate results
	processNextFiles () {
		console.log('processing');
		this.processingCount = 0;
		var processing = [];

		for (var i = 0; i < this.maxRequests; i++) {
			if (this.queue.length > 0) {
				processing.push(this.shiftQueue());
			}
		}

		processing.forEach(this.processFile.bind(this));
	}

	startWatch () {
		if (this._watching === false) {
			this.processNextFiles();
			// http://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-context-inside-a-callback
			this.refreshIntervalID = setInterval(this.processNextFiles.bind(this), this.interval);
			this.setupWatcher();
			this._watching = true;
		} else {
			console.log('The watch has already begun');
		}
	}

	stopWatch () {
		clearInterval(this.refreshIntervalID);
		// console.log(this.refreshIntervalID);
		this.watcher.close();
		this._watching = false;
		this._isSetup = false;
	}
}

module.exports = FileQueue;
