var fs = require('fs');

/**
 * This class holds all of the scan results.
 */
class ScanTank {
  /**
   * Call this with a filepath to load in saved results.
   * @param  {string} filepath The filepath that holds the scan results.
   * @param {function} callback The function you want to call after it finishes reading the results from the specified filepath. If a callback is not specified, then this function becomes synchronous.
   */
  constructor(filepath, callback) {
    this.scanPath = filepath;
    this.scans = {};
    this._readStoredResults(callback);
  }

  _readStoredResults(callback) {
    if (typeof(callback) === "function") {
      fs.readFile(this.scanPath, (err, data) => {
        if (err) return callback(err);
        try {
          if (data.length > 0) this.scans = JSON.parse(data);
        } catch (e) {
          return callback(e);
        }
        return callback();
      });
    } else {
      try {
        var data = fs.readFileSync(this.scanPath);
        if (data.length > 0) this.scans = JSON.parse(data);
      } catch (e) {
        throw e;
      }
    }
  }

  /**
   * This function saves scan results that are currently in memory to the filepath that was used during the creation of the ScanTank object.
   */
  saveResults() { // TODO: Figure out how to test this.
    // TODO: Should I give the ability to specify a particular file to save?
    // TODO: Add callback as an argument
    // TODO: Allow both synchronous and asynchronous saveResults
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
    // TODO: Determine if I should add filepath/result validation.
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
