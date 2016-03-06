var _ = require('lodash');
var fs = require('fs');
var request = require('request');

var VirusTotal = function (apiKey) {
	this.apiKey = apiKey;
	this.fileScanReportURL = 'https://www.virustotal.com/vtapi/v2/file/report'

	var resultRequest = (options, callback) => {
		//SEE IF THIS responseHandler CAN BE MADE IMMUTABLE AT SOME POINT
		//SEE IF REQUEST CAN HANDLE DATA
		var responseHandler = (res) => {
			if (res.statusCode === 200) {
				var data = '';
				res.on('data', (chunk) => {
					data += chunk;
				}).on('end', () => {
					callback(JSON.parse(data));
				});
			} else {
				console.log('Status code: ' + res.statusCode);
				console.log('An error has occured');
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

	this.getFileScanReport = (resourceID, callback) => {
		var param = {
			resource: resourceID,
			apikey: this.apiKey
		};
		var options = {
			url: this.fileScanReportURL,
			form: param
		};

		resultRequest(options, callback);
	}
};

var virustotalObj = new VirusTotal('insert VirusTotal API key');

var printToScreen = (data) => {
	console.log(data);
}

virustotalObj.getFileScanReport('99017f6eebbac24f351415dd410d522d', printToScreen);

exports = VirusTotal;
