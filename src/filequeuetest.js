'use strict';

const fs = require('fs');
const _ = require('lodash');
var chokidar = require('chokidar');

class FileQueue {
	constructor() {
		// Create the file watcher
		this.watcher = chokidar.watch('');
		// TODO: On add, push files to queue and watchedFiles
		this.watcher.on('add', (path) => console.log('Add: ' + path));
		// TODO: On change, push files to queue
		this.watcher.on('change', (path) => console.log('Change: ' + path));

		// Create the rest of the properties
		this.queue = [];
		this.watchedFiles = [];
		this.processing = [];
		this.processingCount = 0;
		this.processed = [];
		this.maxRequests = 4;
		this.interval = 10 * 1000;
		this.refreshIntervalID = null;
	}

	getWatchedFiles () { return this.watchedFiles; }
	getQueuedFiles () { return this.queue; }
	getProcessingFiles () { return this.processing; }
	getProcessedFiles () { return this.processed; }

	watchFiles (files) {
		var filesStr = files.map((val) => val.toString());
		// TODO: Add file path verification
		this.watchedFiles = _.union(filesStr, this.watchedFiles);
		this.queueFiles(filesStr);
		this.watcher.add(filesStr);
	}

	unwatchFiles (files) {
		var filesStr = files.map((val) => val.toString());
		// TODO: Add file path verification
		this.watchedFiles = _.filter(this.watchedFiles, (file) => {
			return _.indexOf(filesStr, file) === -1;
		});
		this.watcher.unwatch(filesStr);
	}

	/* expects an array of strings */
	queueFiles (files) {
		// push file if file is not queued
		files.forEach((file) => {
			if (_.indexOf(this.queue, file) === -1) {
				this.queue.push(file);
			}
		});
	}

	// Move files from queue to processing
	// Move processing files to processed. Replace duplicate results
	processNextFiles () {
		console.log('processing');
		this.processed = _.concat(this.processed, this.processing);
		this.processing = [];
		this.processingCount = 0;
		for (var i = 0; i < this.maxRequests; i++) {
			if (this.queue.length > 0) {
				this.processing.push(this.queue.shift());
				this.processingCount++;
			}
		}
		// console.log("processing next batch of " + this.processingCount++);
	}

	startWatch () {
		if (this.refreshIntervalID === null || 
			this.refreshIntervalID._idleTimeout === -1) {
			// http://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-context-inside-a-callback
			this.refreshIntervalID = setInterval(this.processNextFiles.bind(this), this.interval);
		} else {
			console.log('The watch has already begun');
		}
	}

	stopWatch () {
		clearInterval(this.refreshIntervalID);
		// console.log(this.refreshIntervalID);
	}
}

module.exports = FileQueue;