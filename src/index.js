var _ = require('lodash');
var fs = require('fs');
var request = require('request');

var VirusTotal = function (apiKey) {
	this.apiKey = apiKey;
	this.fileScanReportURL = 'https://www.virustotal.com/vtapi/v2/file/report';
	this.urlScanReportURL = 'http://www.virustotal.com/vtapi/v2/url/report';

	var resultRequest = (options, callback) => {
		var requestHandler = (err, res, body) => {
			if (err) {
				callback(err);
			} else if (res.statusCode === 200) {
				callback(null, JSON.parse(body));
			} else {
				callback(res);
			}
		};

		request
			.post(options, requestHandler);
			// .on('error', () => {     //IS THIS EVENT HANDLER EVEN NECESSARY?
			// 	return;
			// });
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
	};

	this.getUrlScanReport = (resourceID, callback) => {
		var param = {
			resource: resourceID,
			apikey: this.apiKey
		};
		var options = {
			url: this.urlScanReportURL,
			form: param
		};

		resultRequest(options, callback);
	};
};

module.exports = VirusTotal;
