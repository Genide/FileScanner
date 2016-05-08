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
	this.watchFiles = (files) => {
		this.queue = _.union(files.map((val) => val.toString()), this.queue);
	};

	this.unwatchFiles = (files) => {
		var filesStr = files.map((val) => val.toString());
		this.queue = _.filter(this.queue, (file) => {
			return _.indexOf(filesStr, file) === -1;
		});
	};

	this.getWatchedFiles = () => this.queue;
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