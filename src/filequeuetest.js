'use strict';

const fs = require('fs');
const _ = require('lodash');
var chokidar = require('chokidar');

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
	}

	setupWatcher () {
		// TODO: On add, push files to queue and watchedFiles
		this.watcher.on('add', (path, stats) => {
			console.log('Add: ' + path);
			// console.log(stats);
			// this.watchedFiles = _.union(path, this.watchedFiles);
			this.queueFile(path);
			//console.log(this.watcher._watched);
		});
		// TODO: On change, push files to queue
		this.watcher.on('change', (path, stats) => {
			console.log('Change: ' + path);
			// console.log(stats);
			this.queueFile(path);
		});

		this.watcher.on('unlink', (path, stats) => {
			// TODO: remove files from queue
			console.log('Unlink: ' + path);
		});

		this.watcher.on('unlinkDir', (path, stats) => {
			// TODO: remove files from queue
			console.log('UnlinkDir: ' + path);
		});
	}

	// getWatchedFiles () { return this.watchedFiles; }
	getQueuedFiles () { return this.queue; }
	getProcessingFiles () { return this.processing; }
	getProcessedFiles () { return this.processed; }

	watchFiles (files) {
		var filesStr = files.map((val) => val.toString());
		// TODO: Deal with adding files with different slashes
		this.watcher.add(filesStr);

	}

	unwatchFiles (files) {
		var filesStr = files.map((val) => val.toString());
		// TODO: Deal with removing files with different slashes
		this.watcher.unwatch(filesStr);
	}

	/* expects an array of strings */
	queueFile (file) {
		// push file if file is not queued
		// if (_.indexOf(this.queue, file) === -1) {
		if (!this.queue.includes(file)) {
			this.queue.push(file);
		}
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