'use strict';

const fs = require('fs');
const _ = require('lodash');

// var newMessage = {};

// var updateUnwatchList = (queue) => {
// 	newMessage = {type: 'update watchList', files: queue};
// 	process.send(newMessage);
// };

var FileQueue = function () {
	this.queue = [];
	this.watchedFiles = [];
	this.processing = [];
	this.processingCount = 0;
	this.processed = [];
	this.maxRequests = 4;
	this.interval = 10 * 1000;
	this.refreshIntervalID;

	this.watchFiles = (files) => {
		var filesStr = files.map((val) => val.toString());
		this.watchedFiles = _.union(filesStr, this.watchedFiles);
		this.queueFiles(filesStr);
	};

	this.unwatchFiles = (files) => {
		var filesStr = files.map((val) => val.toString());
		this.watchedFiles = _.filter(this.watchedFiles, (file) => {
			return _.indexOf(filesStr, file) === -1;
		});
	};

	/* expects an array of strings */
	this.queueFiles = (files) => {
		// push file if file is not queued
		files.forEach((file) => {
			if (_.indexOf(this.queue, file) === -1) {
				this.queue.push(file);
			}
		});
	};

	// Move files from queue to processing
	// Move processing files to processed. Replace duplicate results
	this.processNextFiles = () => {
		this.processed = this.processed.concat(this.processing);
		this.processing = [];
		this.processingCount = 0;
		for (var i = 0; i < this.maxRequests; i++) {
			if (this.queue.length > 0) {
				this.processing.push(this.queue.shift());
				this.processingCount++;
			}
		}
		// console.log("processing next batch of " + this.processingCount++);
	};

	this.getWatchedFiles = () => this.watchedFiles;
	this.getQueuedFiles = () => this.queue;
	this.getProcessingFiles = () => this.processing;
	this.getProcessedFiles = () => this.processed;

	this.startWatch = () => {
		this.refreshIntervalID = setInterval(this.processNextFiles, this.interval);
	};

	this.stopWatch = () => {
		clearInterval(this.refreshIntervalID);
		console.log(this.refreshIntervalID);
	};

};

// var fileQueue = new FileQueue();

// process.on('message', (message) => {
// 	switch (message.type) {
// 		case 'watch':
// 			fileQueue.watchFiles(message.files);
// 			updateUnwatchList(fileQueue.queue);
// 			break;
// 		case 'unwatch':
// 			fileQueue.unwatchFiles(message.files);
// 			updateUnwatchList(fileQueue.queue);
// 			break;
// 		case 'list':
// 			console.log(fileQueue.queue);
// 			break;
// 		case 'exit': process.exit(0); break;
// 		default: process.exit(0); break;
// 	}
// });

// process.exit(0);

module.exports = FileQueue;