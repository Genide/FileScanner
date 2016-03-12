var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var VirusTotal = require('../src/index.js');

describe('canary', function () {
	var foo = "bar";

	it('canary test', function () {
		expect(foo).to.be.a('string');
		expect(foo).to.equal('bar');
	});
});

describe('getFileScanReport', () => {
	var virustotalObj = new VirusTotal('fake api key');
	
	describe('Good Data', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({response_code: 1}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of 1', (done) => {
			var getResponseCode = (err, data) => {
				expect(data.response_code).to.equal(1);
				expect(data.positives).to.be.an('undefined');
				done();
			};

			virustotalObj.getFileScanReport('fake file resourceID', getResponseCode);
		});
	});

	describe('resourceID not found', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({response_code: 0}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of 0', (done) => {
			var getResponseCode = (err, data) => {
				expect(data.response_code).to.equal(0);
				expect(data.positives).to.be.an('undefined');
				done();
			};

			virustotalObj.getFileScanReport('fake file resourceID', getResponseCode);
		});
	});

	describe('Too many requests', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 204}, undefined);
		});

		after(() => {
			request.post.restore();
		});

		it('204 statusCode', (done) => {
			var getResponseCode = (err, data) => {
				expect(err.statusCode).to.equal(204);
				expect(data).to.be.an('undefined');
				done();
			};

			virustotalObj.getFileScanReport('fake file resourceID', getResponseCode);
		});
	});

	describe('Error with connection', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields('Error message here', null, undefined);
		});

		after(() => {
			request.post.restore();
		});

		it('Error message with connection received', (done) => {
			var getErrorMessage = (err, data) => {
				expect(err).to.equal('Error message here');
				expect(data).to.be.an('undefined');
				done();
			};

			virustotalObj.getFileScanReport('fake file resourceID', getErrorMessage);
		});
	});
});

describe('getURLScanReport', () => {
	var virustotalObj = new VirusTotal('fake api key');
	
	describe('Good Data', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({"response_code": 1}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of 1', (done) => {
			var getResponseCode = (err, data) => {
				expect(data.response_code).to.equal(1);
				expect(err).to.be.an('null');
				done();
			};

			virustotalObj.getUrlScanReport('fake url', getResponseCode);
		});
	});

	describe('url not found', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({"response_code": 0}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of 0', (done) => {
			var getResponseCode = (err, data) => {
				expect(data.response_code).to.equal(0);
				expect(err).to.be.an('null');
				done();
			};

			virustotalObj.getUrlScanReport('fake url', getResponseCode);
		});
	});

	describe('Too many requests', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 204}, undefined);
		});

		after(() => {
			request.post.restore();
		});

		it('204 statusCode', (done) => {
			var getResponseCode = (err, data) => {
				expect(err.statusCode).to.equal(204);
				expect(data).to.be.an('undefined');
				done();
			};

			virustotalObj.getUrlScanReport('fake url', getResponseCode);
		});
	});

	describe('Error with connection', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields('Error message here', null, undefined);
		});

		after(() => {
			request.post.restore();
		});

		it('Error message with connection received', (done) => {
			var getErrorMessage = (err, data) => {
				expect(err).to.equal('Error message here');
				expect(data).to.be.an('undefined');
				done();
			};

			virustotalObj.getFileScanReport('fake url', getErrorMessage);
		});
	});
});

describe('scanFile', () => {
	var virustotalObj = new VirusTotal('fake api key');
	describe('Scan request successfuly queued', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({response_code: 1}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of 1', (done) => {
			var getResponseCode = (err, data) => {
				expect(data.response_code).to.equal(1);
				expect(data.positives).to.be.an('undefined');
				done();
			};

			virustotalObj.scanFile('test/safe.txt', getResponseCode);
		});
	});

	describe('File not found', () => {
		it('Attempting to scan file_does_not_exist.txt', (done) => {
			var getError = (err, data) => {
				expect(err).to.be.an('error');
				expect(data).to.be.an('undefined');
				done();
			};

			virustotalObj.scanFile('test/file_does_not_exist.txt', getError);
		});
	});

	describe('File already queued', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({response_code: -2}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of -2', (done) => {
			var checkStatusCode = (err, data) => {
				expect(data.response_code).to.equal(-2);
				done();
			};

			virustotalObj.scanFile('test/safe.txt', checkStatusCode);
		});
	});
});

describe('rescanFileID', () => {
	var virustotalObj = new VirusTotal('fake api key');
	describe('Rescan successful', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({response_code: 1}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of 1', (done) => {
			var checkStatusCode = (err, data) => {
				expect(data.response_code).to.equal(1);
				done();
			};

			virustotalObj.rescanFileID('some fake resourceID', checkStatusCode);
		});
	});

	describe('Rescan unsuccessful', () => {
		before(() => {
			sinon
				.stub(request, 'post')
				.yields(null, {statusCode: 200}, JSON.stringify({response_code: 0}));
		});

		after(() => {
			request.post.restore();
		});

		it('response_code of 0', (done) => {
			var checkStatusCode = (err, data) => {
				expect(data.response_code).to.equal(0);
				done();
			};

			virustotalObj.rescanFileID('some fake resourceID', checkStatusCode);
		});
	});
});

describe('hashFile', () => {
	var virustotalObj = new VirusTotal('fake api key');
	describe('Good hash', () => {
		it('hashing empty.txt', (done) => {
			var checkHash = (hash) => {
				expect(hash).to.equal('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
				done();
			};

			virustotalObj.hashFile('test/empty.txt', checkHash);
		});

		it('hashing a large file', (done) => {
			var checkHash = (hash) => {
				expect(hash).to.equal('6cf8b71a5a0ab928192bca8ddef58c505b69d151f12a8eba3ac1b1d1bccc274c');
				done();
			};

			virustotalObj.hashFile('test/large_file.txt', checkHash);
		});
	});
});