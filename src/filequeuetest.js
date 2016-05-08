const fs = require('fs');
const _ = require('lodash');

console.log('I was summoned');
// process.send("hello");

// setTimeout(() => process.exit(1), 3000);
var temp;
var queue = [];
var newMessage = {};

var updateUnwatchList = () => {
	newMessage = {type: 'update unwatchList', files: queue};
	process.send(newMessage);
};

process.on('message', (message) => {
	switch (message.type) {
		case 'watch':
			console.log('Watching files: ' + message.files);
			queue = _.union(message.files, queue).map((val) => val.toString());
			updateUnwatchList();
			break;
		case 'unwatch':
			console.log('Unwatching files: ' + message.files);
			queue = _.filter(queue, (file) => {
				return _.indexOf(message.files, file.toString())===-1;
			});
			updateUnwatchList();
			break;
		case 'list':
			console.log(queue);
			break;
		case 'exit': process.exit(0); break;
		default: process.exit(0); break;
	}
});

// process.exit(0);