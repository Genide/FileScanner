var expect = require('chai').expect;
var fileScanner = require('../src/index.js');

describe('canary', function () {
	var foo = "bar";

	it('canary test', function () {
		expect(foo).to.be.a('string');
		expect(foo).to.equal('bar');
	});
});

describe('fileScanner', () => {
	it('Open a file', () => {
		expect(fileScanner.scanFile('test1.txt')).to.equal('test1.txt');
	});
}); 
