var fs = require('fs');
var path = require('path');
var request = require('request');
var crypto = require('crypto');

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

/**
 * The VirusTotal class.
 * This class contains the URLs and methods needed to interact with the VirusTotal API.
 */
class VirusTotal {
	/**
	 * Create a VirusTotal object
	 * @param {string} apiKey - The VirusTotal API key. If you do not provide a key, then any calls to the VirusTotal will not work.
	 */
	constructor (apiKey) {
		/** @public */
		this.apiKey = apiKey;
		/** @public */
		this.fileScanReportURL = 'https://www.virustotal.com/vtapi/v2/file/report';
		/** @public */
		this.urlScanReportURL = 'http://www.virustotal.com/vtapi/v2/url/report';
		/** @public */
		this.scanFileURL = 'https://www.virustotal.com/vtapi/v2/file/scan';
		/** @public */
		this.rescanFileURL = 'https://www.virustotal.com/vtapi/v2/file/rescan';
		/** @public */
		this.postCommentURL = 'https://www.virustotal.com/vtapi/v2/comments/put';
		/** @public */
		this.IPReportURL = 'http://www.virustotal.com/vtapi/v2/ip-address/report';
		/** @public */
		this.domainReportURL = 'http://www.virustotal.com/vtapi/v2/domain/report';
	}

	/**
	 * This function is used get a file scan report.
	 * @param  {string}   resourceID A md5/sha1/sha256 hash will retrieve the most recent report on a given sample. You may also specify a scan_id (sha256-timestamp as returned by the file upload API) to access a specific report. You can also specify a CSV list made up of a combination of hashes and scan_ids (up to 4 items with the standard request rate), this allows you to perform a batch request with one single call.
	 * @param  {VirusTotal~requestCallback} callback   The callback that handles the VirusTotal response object
	 */
	getFileScanReport (resourceID, callback) {
		var param = {
			resource: resourceID,
			apikey: this.apiKey
		};
		var options = {
			url: this.fileScanReportURL,
			formData: param
		};

		postRequest(options, callback);
	}

	getUrlScanReport (url, callback) {
		var param = {
			resource: url,
			apikey: this.apiKey
		};
		var options = {
			url: this.urlScanReportURL,
			formData: param
		};

		postRequest(options, callback);
	}

	scanFile (filepath, callback) {
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

	rescanFileID (resourceID, callback) {
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

	hashFile (filepath, callback) {
		var hash = crypto.createHash('SHA256');
		var stream = fs.createReadStream(filepath);

		stream.on('data', (data) => {
			hash.update(data);
		});

		stream.on('end', () => {
			callback(null, hash.digest('hex'));
		});
	}

	getIPReport (ip, callback) {
		var param = {
			ip: ip,
			apikey: this.apiKey
		};
		var options = {
			url: this.IPReportURL,
			qs: param
		};

		getRequest(options, callback);
	}

	getDomainReport (domain, callback) {
		var param = {
			domain: domain,
			apikey: this.apiKey
		};
		var options = {
			url: this.domainReportURL,
			qs: param
		};

		getRequest(options, callback);
	}

	postComment (resourceID, comment, callback) {
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
	}
}

/**
 * This callback handles the VirusTotal response object.
 * @callback VirusTotal~requestCallback
 * @param {Error} error - The Error object
 * @param {json} data - The VirusTotal json response object.
 */

module.exports = VirusTotal;
