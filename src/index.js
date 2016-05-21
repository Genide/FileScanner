var fs = require('fs');
var path = require('path');
var request = require('request');
var crypto = require('crypto');


// TODO: Change to the new class definition
var VirusTotal = function (apiKey) {
	this.apiKey = apiKey;
	this.fileScanReportURL = 'https://www.virustotal.com/vtapi/v2/file/report';
	this.urlScanReportURL = 'http://www.virustotal.com/vtapi/v2/url/report';
	this.scanFileURL = 'https://www.virustotal.com/vtapi/v2/file/scan';
	this.rescanFileURL = 'https://www.virustotal.com/vtapi/v2/file/rescan';
	this.postCommentURL = 'https://www.virustotal.com/vtapi/v2/comments/put';
	this.IPReportURL = 'http://www.virustotal.com/vtapi/v2/ip-address/report';
	this.domainReportURL = 'http://www.virustotal.com/vtapi/v2/domain/report';

	var postRequest = (options, callback) => {
		var requestHandler = (err, res, body) => {
			if (err) return callback(err);
			if (res) {
				if (res.statusCode === 200) {
					return callback(null, JSON.parse(body));
				} else if (res.statusCode === 204) {
					return callback(new Error("Too many requests"));
				} else {
					return callback(err, JSON.parse(body));
				}
			}
			return callback(new Error("Unknown problem occured"));
		};

		request.post(options, requestHandler);
	};

	var getRequest = (options, callback) => {
		var requestHandler = (err, res, body) => {
			if (err) return callback(err);
			if (res) {
				if (res.statusCode === 200) {
					return callback(null, JSON.parse(body));
				} else if (res.statusCode === 204) {
					return callback(new Error("Too many requests"));
				} else {
					return callback(err, JSON.parse(body));
				}
			}
			return callback(new Error("Unknown problem occured"));
		};

		request.get(options, requestHandler);
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
	};

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
	};

	this.hashFile = (filepath, callback) => {
		var hash = crypto.createHash('SHA256');
		var stream = fs.createReadStream(filepath);

		stream.on('data', (data) => {
			hash.update(data);
		});

		stream.on('end', () => {
			callback(null, hash.digest('hex'));
		});
	};

	this.getIPReport = (ip, callback) => {
		var param = {
			ip: ip,
			apikey: this.apiKey
		};
		var options = {
			url: this.IPReportURL,
			qs: param
		};

		getRequest(options, callback);
	};

	this.getDomainReport = (domain, callback) => {
		var param = {
			domain: domain,
			apikey: this.apiKey
		};
		var options = {
			url: this.domainReportURL,
			qs: param
		};

		getRequest(options, callback);
	};

	this.postComment = (resourceID, comment, callback) => {
		var param = {
			resource: resourceID,
			comment: comment,
			apikey: this.apiKey
		};
		var options = {
			url: this.postCommentURL,
			formData: param
		};

		postRequest(options, callback);
	};
};

module.exports = VirusTotal;
