var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var VirusTotal = require('../src/index.js');

var virustotalObj = new VirusTotal('fake api key');

describe('canary', function () {
	var foo = "bar";

	it('canary test', function () {
		expect(foo).to.be.a('string');
		expect(foo).to.equal('bar');
	});
});

describe('Good Data', () => {
	var checkResultsFactory;

	before(() => {
		// Initialize checkResultsFactory
		checkResultsFactory = function (callback) {
			return function (err, body) {
				expect(body.response_code).to.equal(1);
				return callback();
			};
		};
		// stub out the requsts
		sinon
			.stub(request, 'post')
			.yields(null, {statusCode: 200}, JSON.stringify({response_code: 1}));
		sinon
			.stub(request, 'get')
			.yields(null, {statusCode: 200}, JSON.stringify({response_code: 1}));
	});

	after(() => {
		request.post.restore();
		request.get.restore();
	});

	it("getFileScanReport", (done) => {
		virustotalObj.getFileScanReport('fake resource ID', checkResultsFactory(done));
	});

	it("getUrlScanReport", (done) => {
		virustotalObj.getUrlScanReport('fake url', checkResultsFactory(done));
	});

	it("scanFile", (done) => {
		virustotalObj.scanFile('fake filepath', checkResultsFactory(done));
	});

	it("rescanFileID", (done) => {
		virustotalObj.rescanFileID('fake file id', checkResultsFactory(done));
	});

	it("getIPReport", (done) => {
		virustotalObj.getIPReport('fake ip', checkResultsFactory(done));
	});

	it("getDomainReport", (done) => {
		virustotalObj.getDomainReport('fake domain', checkResultsFactory(done));
	});

	it("postComment", (done) => {
		virustotalObj.postComment('fake resource ID', 'fake comment', checkResultsFactory(done));
	});
});

describe("Too many requests", () => {
	var checkTooManyRequestsFactory;
	before(() => {
		// Initialize checkTooManyRequestsFactory
		checkTooManyRequestsFactory = function (callback) {
			return function (err, body) {
				expect(err.message).to.equal("Too many requests");
				return callback();
			};
		};
		// Stub out requests
		sinon
			.stub(request, 'post')
			.yields(null, {statusCode: 204});
		sinon
			.stub(request, 'get')
			.yields(null, {statusCode: 204});
	});

	after(() => {
		request.post.restore();
		request.get.restore();
	});

	it("getFileScanReport", (done) => {
		virustotalObj.getFileScanReport('fake file id', checkTooManyRequestsFactory(done));
	});

	it("getIPReport", (done) => {
		virustotalObj.getIPReport('fake ip', checkTooManyRequestsFactory(done));
	});
});

describe("General request error", () => {
	var checkErrorFactory;
	before(() => {
		// Initialize checkErrorFactory
		checkErrorFactory = function (callback) {
			return function (err, body) {
				expect(err).to.be.an("Error");
				return callback();
			};
		};
		// Stub out requests
		sinon
			.stub(request, 'post')
			.yields(new Error());
		sinon
			.stub(request, 'get')
			.yields(new Error());
	});

	after(() => {
		request.post.restore();
		request.get.restore();
	});

	it("getFileScanReport", (done) => {
		virustotalObj.getFileScanReport('fake file id', checkErrorFactory(done));
	});

	it("getIPReport", (done) => {
		virustotalObj.getIPReport('fake ip', checkErrorFactory(done));
	});
});

describe("General request response", () => {
	var checkRequestFactory;
	before(() => {
		// Initialize checkRequestFactory
		checkRequestFactory = function (callback) {
			return function(err, body) {
				expect(body.canary).to.equal("bird");
				return callback();
			};
		};
		// Stub out requests
		sinon
			.stub(request, 'post')
			.yields(undefined, {statusCode: 9999}, JSON.stringify({canary: "bird"}));
		sinon
			.stub(request, 'get')
			.yields(undefined, {statusCode: 9999}, JSON.stringify({canary: "bird"}));
	});

	after(() => {
		request.post.restore();
		request.get.restore();
	});

	it("getFileScanReport", (done) => {
		virustotalObj.getFileScanReport('fake file id', checkRequestFactory(done));
	});

	it("getIPReport", (done) => {
		virustotalObj.getIPReport('fake ip', checkRequestFactory(done));
	});
});

describe("unknown error", () => {
	var checkErrorFactory;
	before(() => {
		// Initialize checkErrorFactory
		checkErrorFactory = function (callback) {
			return function (err, body) {
				expect(err).to.be.an("Error");
				expect(err.message).to.equal("Unknown problem occured");
				return callback();
			};
		};
		// Stub out requests
		sinon
			.stub(request, 'post')
			.yields();
		sinon
			.stub(request, 'get')
			.yields();
	});

	after(() => {
		request.post.restore();
		request.get.restore();
	});

	it("getFileScanReport", (done) => {
		virustotalObj.getFileScanReport('fake file id', checkErrorFactory(done));
	});

	it("getIPReport", (done) => {
		virustotalObj.getIPReport('fake ip', checkErrorFactory(done));
	});
});

describe('hashFile', () => {
	var checkHashFactory;
	before(function () {
		// Initialize checkHashFactory
		checkHashFactory = function (correctHash, callback){
			return function (err, hash) {
				expect(hash).to.equal(correctHash);
				return callback();
			};
		};
	});

	describe('Good hash', () => {
		it('hashing empty.txt', (done) => {
			virustotalObj.hashFile('test/files/empty.txt',
				checkHashFactory('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', done));
		});

		it('hashing a large file', (done) => {
			virustotalObj.hashFile('test/files/large_file.txt',
				checkHashFactory('312b6e50a511a8cb8fe8d0d51a44be8591c003b63d51726aec1df632f1879b41', done));
		});
	});
});
