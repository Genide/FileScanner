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
	before(() => {
		sinon
			.stub(request, 'post')
			.yields(null, {statusCode: 200}, JSON.stringify({response_code: 1}));
	});

	after(() => {
		request.post.restore();
	});

	it("getFileScanReport", (done) => {
		var checkResults = (err, body) => {
			expect(body.response_code).to.equal(1);
			return done();
		};
		virustotalObj.getFileScanReport('fake resource ID', checkResults);
	});

	it("getUrlScanReport", (done) => {
		var checkResults = (err, body) => {
			expect(body.response_code).to.equal(1);
			return done();
		};
		virustotalObj.getUrlScanReport('fake url', checkResults);
	});

	it("scanFile", (done) => {
		var checkResults = (err, body) => {
			expect(body.response_code).to.equal(1);
			return done();
		};
		virustotalObj.scanFile('fake filepath', checkResults);
	});

	it("rescanFileID", (done) => {
		var checkResults = (err, body) => {
			expect(body.response_code).to.equal(1);
			return done();
		};
		virustotalObj.rescanFileID('fake file id', checkResults);
	});
});

describe("Too many requests", () => {
	before(() => {
		sinon
			.stub(request, 'post')
			.yields(null, {statusCode: 204});
	});

	after(() => {
		request.post.restore();
	});

	it("getFileScanReport", (done) => {
		var checkError = (err, body) => {
			expect(err.message).to.equal("Too many requests");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});

	it("getUrlScanReport", (done) => {
		var checkError = (err, body) => {
			expect(err.message).to.equal("Too many requests");
			done();
		};
		virustotalObj.getUrlScanReport('fake url', checkError);
	});

	it("scanFile", (done) => {
		var checkError = (err, body) => {
			expect(err.message).to.equal("Too many requests");
			done();
		};
		virustotalObj.scanFile('fake filepath', checkError);
	});

	it("rescanFileID", (done) => {
		var checkError = (err, body) => {
			expect(err.message).to.equal("Too many requests");
			done();
		};
		virustotalObj.rescanFileID('fake file id', checkError);
	});
});

describe("General request error", () => {
	before(() => {
		sinon
			.stub(request, 'post')
			.yields(new Error());
	});

	after(() => {
		request.post.restore();
	});

	it("getFileScanReport", (done) => {
		var checkError = (err, body) => {
			expect(err).to.be.an("Error");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});
});

describe("General request response", () => {
	before(() => {
		sinon
			.stub(request, 'post')
			.yields(undefined, {statusCode: 9999}, JSON.stringify({canary: "bird"}));
	});

	after(() => {
		request.post.restore();
	});

	it("getFileScanReport", (done) => {
		var checkError = (err, body) => {
			expect(body.canary).to.equal("bird");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});
});

describe("unknown error", () => {
	before(() => {
		sinon
			.stub(request, 'post')
			.yields();
	});

	after(() => {
		request.post.restore();
	});

	it("getFileScanReport", (done) => {
		var checkError = (err, body) => {
			expect(err).to.be.an("Error");
			expect(err.message).to.equal("Unknown problem occured");
			done();
		};
		virustotalObj.getFileScanReport('fake file id', checkError);
	});
});

describe('hashFile', () => {
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
