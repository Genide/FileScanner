var _ = require('lodash');
var fs = require('fs');
var request = require('request');

var scanFile = function (filepath) {
	return filepath;
};

exports.scanFile = scanFile;