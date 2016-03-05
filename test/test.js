var expect = require('chai').expect;
var index = require('../src/index.js');

var foo = "bar";

it('canary test', function () {
	expect(foo).to.be.a('string');
	expect(foo).to.equal('bar');
});

it('add', function () {
	expect(index.add(2, 3)).to.equal(5);
});