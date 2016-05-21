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
	// .autocomplete(() => fileQueue.getWatchedFiles()) // lambda function to retain fileQueue context
	.autocomplete(fsAutocomplete())
	.action((args, callback) => {
		fileQueue.unwatchFiles(args.files);
		callback();
	});

vorpal
	.command('count', 'Print the number of files processed this interval')
	.action((args, callback) => {
		console.log(fileQueue.getProcessingCount());
		callback();
	});

vorpal
	.command('list', 'List all watched files')
	.action((args, callback) => {
		console.log(fileQueue.getWatchedFiles());
		callback();
	});

vorpal
	.command('queue', 'List all queued files')
	.action((args, callback) => {
		console.log(fileQueue.getQueuedFiles());
		callback();
	});

vorpal
	.command('next', 'List all the queued files that are getting priority')
	.action((args, callback) => {
		console.log(fileQueue.getNextIntervalQueuedFiles());
		callback();
	});

vorpal
	.command('processed', 'List all processed files')
	.action((args, callback) => {
		console.log(fileQueue.getProcessedFiles());
		callback();
	});

vorpal
	.command('startwatch', 'Starts watching files')
	.action((args, callback) => {
		fileQueue.startWatch();
		callback();
	});

vorpal
	.command('stopwatch', 'Stops watching files')
	.action((args, callback) => {
		fileQueue.stopWatch();
		callback();
	});

vorpal
	.command('debug', 'Show debug information')
	.action((args, callback) => {
		console.log(fileQueue);
		callback();
	});

vorpal
	.delimiter('fileQueueProcess> ')
	.show();