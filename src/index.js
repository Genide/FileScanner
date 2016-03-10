var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var request = require('request');
var crypto = require('crypto');

var VirusTotal = function (apiKey) {
	this.apiKey = apiKey;
	this.fileScanReportURL = 'https://www.virustotal.com/vtapi/v2/file/report';
	this.urlScanReportURL = 'http://www.virustotal.com/vtapi/v2/url/report';
	this.scanFileURL = 'https://www.virustotal.com/vtapi/v2/file/scan';
	this.rescanFileURL = 'https://www.virustotal.com/vtapi/v2/file/rescan';

	var postRequest = (options, callback) => {
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
			formData: param
		};

		postRequest(options, callback);
	};

	this.getUrlScanReport = (url, callback) => {
		var param = {
			resource: url,
			apikey: this.apiKey
		};
		var options = {
			url: this.urlScanReportURL,
			formData: param
		};

		postRequest(options, callback);
	};

	this.scanFile = (filepath, callback) => {
		var param = {
			file: ("file", path.basename(filepath), fs.createReadStream(filepath)),
			apikey: this.apiKey
		};
		var options = {
			url: this.scanFileURL,
			formData: param
		};

		postRequest(options, callback);
	}

	this.rescanFileID = (resourceID, callback) => {
		var param = {
			resource: resourceID,
			apikey: this.apiKey
		};
		var options = {
			url: this.rescanFileURL,
			formData: param
		};

		postRequest(options, callback);
	}

	this.hashFile = (filepath, callback) => {
		var hash = crypto.createHash('sha256');
		var stream = fs.createReadStream(filepath);

		stream.on('data', (data) => {
			hash.update(data, 'utf8');
		});

		stream.on('end', () => {
			callback(hash.digest('hex'));
		});
	};
};

module.exports = VirusTotal;
