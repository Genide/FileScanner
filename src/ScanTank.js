var fs = require('fs');

/**
 * This class holds all of the scan results.
 */
class ScanTank {
  /**
   * Call this with a filepath to load in saved results.
   * @param  {string} filepath The filepath that holds the scan results.
   */
  constructor(filepath) {
    this.scanPath = filepath;
    this.scans = {};
    this._readStoredResults();
  }

  _readStoredResults() {
    // TODO: Figure out what to do with a bad filepath
    // TODO: Figure out what to do with an undefined filepath
    // TODO: Implement callback argument
    fs.readFile(this.scanPath, (err, data) => {
      if (err) throw err;
      this.scans = JSON.parse(data);
    });
  }

  /**
   * This function saves scan results that are currently in memory to the filepath that was used during the creation of the ScanTank object.
   */
  saveResults() { // TODO: Figure out how to test this.
    // TODO: Should I give the ability to specify a particular file to save?
    // TODO: Add callback as an argument
    fs.writeFile(this.scanPath, JSON.stringify(this.scans), (err) => {
      if (err) throw err;
    });
  }

  /**
   * Add a scan result to the ScanTank
   * @param {string} filepath The filepath of the file that was scanned.
   * @param {JSON} result   The result object from VirusTotal
   */
  addResult(filepath, result) {
    this.scans[filepath] = result;
  }

  /**
   * Retrieve a result from the ScanTank.
   * @param  {string} filepath The filepath you want to get a VirusTotal scan result from.
   */
  getResult(filepath) {
    return this.scans[filepath];
  }
}

module.exports = ScanTank;
