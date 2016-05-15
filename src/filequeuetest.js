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
		this.interval = 60 * 1000;
		this.refreshIntervalID = null;
		this.vtObj = new VirusTotal('apikey');
	}

	setupWatcher () {
		this.watcher.on('add', (path, stats) => {
			console.log('Add: ' + path);
			// console.log(stats);
			this.queueFile(path, 'new');
			//console.log(this.watcher._watched);
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

	queueFile (file, status) {
		// push file if file is not queued
		// TODO: Add some meta data about what to do with the file.
		// if (!this.queue.includes(file)) {
		// 	this.queue.push(file);
		// }
		var searchObj = {
			"filepath": file,
			"status": status
		};
		if (_.find(this.queue, searchObj) === undefined){
			this.queue.push(searchObj);
		}
	}

	dequeueFile (file) {
		// var index = this.queue.indexOf(file);
		// if (index >= 0) {
		// 	this.queue.splice(index, 1);
		// }
		var searchObj = {
			"filepath": file
		};
		_.pullAllBy(this.queue, [searchObj], 'filepath');
	}

	handleResult (processingFile, result) {
		switch (processingFile.status) {
			case 'new':
				if (result.response_code === 1) {
					this.processed[processingFile.filepath] = result;
				} else {
					this.queueFile(processingFile.filepath, 'scanning');
				}
				break;
			case 'scanning':
				if (result.response_code === 1) {
					this.queueFile(processingFile.filepath, 'reporting');
				}
				break;
			case 'reporting':
				if (result.response_code === 1) {
					this.processed[processingFile.filepath] = result;
				} else {
					this.queueFile(processingFile.filepath, 'reporting');
				}
				break;
		}
	}

	// Move files from queue to processing
	// Move processing files to processed. Replace duplicate results
	processNextFiles () {
		console.log('processing');
		//this.processed = _.concat(this.processed, this.processing);
		this.processingCount = 0;
		for (var i = 0; i < this.maxRequests; i++) {
			if (this.queue.length > 0) {
				this.processing.push(this.queue.shift());
				this.processingCount++;
			}
		}

		var handleWork = function (file, callback) {
			switch (file.status) {
				case 'new':
				case 'reporting':
					console.log(file.filepath);
					async.waterfall([
						function (cb) {
							cb(null, file.filepath);
						},
						this.vtObj.hashFile,
						this.vtObj.getFileScanReport
					], callback); // TODO: attach filepath to object, then call calback
					break;
				case 'scanning': 
					// TODO: use async.waterfall and attach filepath to object, then call callback
					this.vtObj.scanFile(file.filepath, callback);
					break;
				default:
					callback (new Error('Unexpected file.action: ' + file.action));
			}
		};
		// TODO: Use queueFile function and correct status instead of directly pushing
		var handleResults = function (err, results) {
			if (err) {
				console.log(err);
				process.exit(1);
			}
			for (var i = 0; i < this.processing.length; i++) {
				this.handleResult(this.processing[i], results[i]);
			}
			this.processing = [];
		};
		async.map(this.processing, handleWork.bind(this), handleResults.bind(this));
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