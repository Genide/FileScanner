const fork = require('child_process').fork;
const vorpal = require('vorpal')();
const fsAutocomplete = require('vorpal-autocomplete-fs');
const fileQueue = fork('src/filequeuetest.js',
	{
		silent: false
	});

var unwatchList = ['a','b','c'];
var getUnwatchList = () => unwatchList;

fileQueue.on('close', (code, signal) => {
	if (code) console.log('Program exited with code ' + code);
	if (signal) console.log('Program exited with signal ' + signal);
	process.exit(0);
});

fileQueue.on('message', (message) => {
	switch (message.type) {
		case 'update unwatchList':
			unwatchList = message.files;
			break;
	}
});

vorpal
	.command('watch <files...>', 'Starts watching files')
	.autocomplete(fsAutocomplete())
	.action((args, callback) => {
		// args.files.forEach((file) => {
		// 	console.log('Start watching ' + file);
		// });
		fileQueue.send({type: 'watch', files: args.files});
		callback();
	});

vorpal
	.command('unwatch <files...>', 'Stop watching files')
	.autocomplete(getUnwatchList)
	.action((args, callback) => {
		// args.files.forEach((file) => {
		// 	console.log('Stop watching ' + file);
		// });
		fileQueue.send({type: 'unwatch', files: args.files});
		callback();
	});

vorpal
	.command('list', 'List all watched files')
	.action((args, callback) => {
		fileQueue.send({type: 'list'});
		callback();
	});


vorpal
	.delimiter('FileQueue> ')
	.show();