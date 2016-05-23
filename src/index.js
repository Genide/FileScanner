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
	 * This function is used to get a file scan report.
	 * @param  {string}   resourceID A MD5/SHA1/SHA256 hash will retrieve the most recent report on a given sample. You may also specify a scan_id (sha256-timestamp as returned by the file upload API) to access a specific report. You can also specify a CSV list made up of a combination of hashes and scan_ids (up to 4 items with the standard request rate), this allows you to perform a batch request with one single call.
	 * @param  {VirusTotal~requestCallback} callback   The callback that handles the VirusTotal json response object
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

	/**
	 * This function is used to get a url scan report.
	 * @param  {string}   url A URL will retrieve the most recent report on the given URL. You may also specify a scan_id (sha256-timestamp as returned by the URL submission API) to access a specific report. At the same time, you can specify a CSV list made up of a combination of hashes and scan_ids so as to perform a batch request with one single call (up to 4 resources per call with the standard request rate). When sending multiples, the scan_ids or URLs must be separated by a new line character.
	 * @param  {VirusTotal~requestCallback} callback The callback that handles the VirusTotal json response object
	 */
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

	/**
	 * This function is used to send a file for scanning.
	 * Note that the object returned using the callback is not the file scan result. The json object returned only tells whether or not the file has been sucessfully queued for scanning.
	 * @param  {string}   filepath The filepath to the file you want VirusTotal to scan
	 * @param  {VirusTotal~requestCallback} callback The callback that handles the VirusTotal json response object
	 */
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

	/**
	 * This function is used to rescan a file.
	 * Note that the object returned using the callback is not the file scan result. The json object returned only tells whether or not the file has been sucessfully queued for scanning.
	 * @param  {string}   resourceID A MD5/SHA1/SHA256 hash. You can also specify a CSV list made up of a combination of any of the three allowed hashes (up to 25 items), this allows you to perform a batch request with one single call. Note that the file must already be present in the VirusTotal file store.
	 * @param  {VirusTotal~requestCallback} callback   The callback that handles the VirusTotal json response object
	 */
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

	/**
	 * This function will generate a resourceID to use. The hash is generated using SHA256.
	 * @param  {string}   filepath The filepath to the file you want hash using SHA256
	 * @param  {VirusTotal~hashCallback} callback The callback that handles the SHA256 hash
	 */
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

	/**
	 * This function is used to get an IP report.
	 * @param  {string}   ip A valid IPv4 address in dotted quad notation, for the time being only IPv4 addresses are supported.
	 * @param  {VirusTotal~requestCallback} callback The callback that handles the VirusTotal json response object
	 */
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

	/**
	 * This function is used to get a domain report.
	 * @param  {string}   domain  The domain you want to get a report on.
	 * @param  {VirusTotal~requestCallback} callback The callback that handles the VirusTotal json response object
	 */
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

	/**
	 * This function posts a comment on a file report.
	 * @param  {string}   resourceID Either a md5/sha1/sha256 hash of the file you want to review or the URL itself that you want to comment on.
	 * @param  {string}   comment    The comment you want to post
	 * @param  {VirusTotal~requestCallback} callback The callback that handles the VirusTotal json response object
	 */
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

 /**
  * This callback handles the generated hash.
  * @callback VirusTotal~hashCallback
  * @param {Error} error - The Error object
  * @param {string} hash - The returned hash string
  */

module.exports = VirusTotal;
