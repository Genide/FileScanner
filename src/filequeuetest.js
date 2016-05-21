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
		var searchObj = {
			"filepath": file,
			"status": status
		};
		// TODO: Determine if i should find by filepath first
		// then decide what to do based on the status
		if (_.find(this.queue, searchObj) === undefined){
			this.queue.push(searchObj);
		}
	}

	dequeueFile (file) {
		var searchObj = {
			"filepath": file
		};
		_.pullAllBy(this.queue, [searchObj], 'filepath');
	}

	handleResult (result) {
		// TODO: It is worth keeping the filepath and status?
		// Should I trust async.map to keep the result ordering?
		switch (result.status) {
			case 'new':
				if (result.response_code === 1) {
					this.processed[result.filepath] = result;
				} else {
					this.queueFile(result.filepath, 'scanning');
				}
				break;
			case 'scanning':
				if (result.response_code === 1) {
					this.queueFile(result.filepath, 'reporting');
				}
				break;
			case 'reporting':
				if (result.response_code === 1) {
					this.processed[result.filepath] = result;
				} else {
					this.queueFile(result.filepath, 'reporting');
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
						this.vtObj.getFileScanReport,
						function (result, cb) {
							result.filepath = file.filepath;
							result.status = file.status;
							cb(null, result);
						}
					], callback);
					break;
				case 'scanning': 
					async.waterfall([
						function (cb) {
							cb(null, file.filepath);
						},
						this.vtObj.scanFile,
						function(result, cb) {
							result.filepath = file.filepath;
							result.status = file.status;
							cb(null, result);
						}
					], callback);
					break;
				default:
					callback (new Error('Unexpected file.action: ' + file.action));
			}
		};
		var handleResults = function (err, results) {
			if (err) {
				console.log(err);
				process.exit(1);
			}
			results.forEach(this.handleResult.bind(this));
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