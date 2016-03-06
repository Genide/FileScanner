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
});