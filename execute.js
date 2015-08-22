/* global Promise */
'use strict';
var exec = require('child_process').exec;

module.exports = execute;

function isNullorUndefined(x) {
  return x === undefined || x === null || x === '';
}

function execute(command, options) {
  return new Promise(function (resolve, reject) {
    exec(command, options, function callback(error, stdout, stderr) {
      if (!isNullorUndefined(error)) {
        
        console.log('EXEC ERROR: ' + error);
        reject(error);
      } else if (!isNullorUndefined(stdout)) {
        // console.log(stdout);
        resolve(stdout);
      } else if (!isNullorUndefined(stderr)) {
        console.log('ERROR: ' + stderr);
        reject(stderr);
      }
    });
  });
}


