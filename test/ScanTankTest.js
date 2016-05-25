var expect = require('chai').expect;
var sinon = require('sinon');
var ScanTank = require('../src/ScanTank.js');
var fs = require('fs');

describe('canary', () => {
  it('test', () => {
    expect(1 + 1).to.equal(2);
  });
});

describe('ScanTank', () => {
  describe('addResult', () => {
    it('adding a new result', () => {
      var scanTank = new ScanTank('test/files/empty.txt');
      scanTank.addResult('testfile.txt', {result: "bad"});
      expect(scanTank.scans).to.deep.equal({'testfile.txt': {result: 'bad'}});
    });
  });

  describe('getResult', () => {
    it('get a result', () => {
      var scanTank = new ScanTank('test/files/results.txt');
      scanTank.addResult('testfile.txt', {result: "bad"});
      expect(scanTank.getResult('testfile.txt')).to.deep.equal({result: 'bad'});
    });
  });
});
