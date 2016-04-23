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
	var checkResultsFactory = function (callback) {
		return function (err, body) {
			expect(body.response_code).to.equal(1);
			return callback();
		};
	};

	before(() => {
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
	before(() => {
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
		var checkError = (err, body) => {
			expect(err.message).to.equal("Too many requests");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});

	it("getIPReport", (done) => {
		var checkError = (err, body) => {
			expect(err.message).to.equal("Too many requests");
			done();
		};
		virustotalObj.getIPReport('fake ip', checkError);
	});
});

describe("General request error", () => {
	before(() => {
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
		var checkError = (err, body) => {
			expect(err).to.be.an("Error");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});

	it("getIPReport", (done) => {
		var checkError = (err, body) => {
			expect(err).to.be.an("Error");
			done();
		};
		virustotalObj.getIPReport('fake ip', checkError);
	});
});

describe("General request response", () => {
	before(() => {
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
		var checkError = (err, body) => {
			expect(body.canary).to.equal("bird");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});

	it("getIPReport", (done) => {
		var checkError = (err, body) => {
			expect(body.canary).to.equal("bird");
			done();
		};
		virustotalObj.getIPReport('fake ip', checkError);
	});
});

describe("unknown error", () => {
	before(() => {
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
		var checkError = (err, body) => {
			expect(err).to.be.an("Error");
			expect(err.message).to.equal("Unknown problem occured");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});

	it("getIPReport", (done) => {
		var checkError = (err, body) => {
			expect(err).to.be.an("Error");
			expect(err.message).to.equal("Unknown problem occured");
			done();
		};
		virustotalObj.getIPReport('fake ip', checkError);
	});
});

describe('hashFile', () => {
	var checkHashFactory = function (correctHash, callback) {
		return function (hash) {
			expect(hash).to.equal(correctHash);
			return callback();
		};
	};
	
	describe('Good hash', () => {
		it('hashing empty.txt', (done) => {
			virustotalObj.hashFile('test/empty.txt', 
				checkHashFactory('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', done));
		});

		it('hashing a large file', (done) => {
			virustotalObj.hashFile('test/large_file.txt', 
				checkHashFactory('6cf8b71a5a0ab928192bca8ddef58c505b69d151f12a8eba3ac1b1d1bccc274c', done));
		});
	});
});
