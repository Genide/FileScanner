'use strict';

const vorpal = require('vorpal')();
const fsAutocomplete = require('vorpal-autocomplete-fs');
const FileQueue = require('./filequeuetest.js');

var fileQueue = new FileQueue();

vorpal
	.command('watch <files...>', 'Starts watching files')
	.autocomplete(fsAutocomplete())
	.action((args, callback) => {
		fileQueue.watchFiles(args.files);
		callback();
	});

vorpal
	.command('unwatch <files...>', 'Stop watching files')
	.autocomplete(fileQueue.getWatchedFiles)
	.action((args, callback) => {
		fileQueue.unwatchFiles(args.files);
		callback();
	});

vorpal
	.command('list', 'List all watched files')
	.action((args, callback) => {
		console.log(fileQueue.getWatchedFiles());
		callback();
	});


vorpal
	.delimiter('fileQueueProcess> ')
	.show();