'use strict';

const fs = require('fs');
const _ = require('lodash');

class FileQueue {
	constructor() {
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
		this.watchedFiles = _.union(filesStr, this.watchedFiles);
		this.queueFiles(filesStr);
	}

	unwatchFiles (files) {
		var filesStr = files.map((val) => val.toString());
		this.watchedFiles = _.filter(this.watchedFiles, (file) => {
			return _.indexOf(filesStr, file) === -1;
		});
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
		// console.log('processing');
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
			this.refreshIntervalID = setInterval(this.processNextFiles, this.interval);
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