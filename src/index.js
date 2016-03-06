var _ = require('lodash');
var fs = require('fs');
var request = require('request');

var fileScanReportURL = 'https://www.virustotal.com/vtapi/v2/file/report';

//MAKE THIS PROJECT INTO A VIRUSTOTAL OBJECT!!!!!

var resultRequest = (options, callback) => {
	//SEE IF THIS responseHandler CAN BE MADE IMMUTABLE AT SOME POINT
	var responseHandler = (res) => {
		if (res.statusCode === 200) {
			var data = '';
			res.on('data', (chunk) => {
				data += chunk;
			}).on('end', () => {
				callback(JSON.parse(data));
			});
		} else {
			return;
		}
	};

	request
		.post(options)
		.on('response', responseHandler)
		.on('error', () => {
			return;
		});
};

var getFileScanReport = (resourceID) => {
	var param = {
		resource: resourceID,
		apikey: ''
	};
	var options = {
		url: 'https://www.virustotal.com/vtapi/v2/file/report',
		form: param
	};

	var printToScreen = (data) => {
		console.log(data);
	};

	resultRequest(options, printToScreen);
}

getFileScanReport('99017f6eebbac24f351415dd410d522d');

//exports.scanFile = scanFile;