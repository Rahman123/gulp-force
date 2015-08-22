/* global Promise */
'use strict';
var config = require('./config/jsforce.config');
var execute = require('./execute');
var logit = require('./logit');

module.exports = login;


function logError(error) {
  console.log(error);
  return error;
}

function checkActiveUser(response) {
  // Make sure the logged in user matches the user from the jsforce file
  if (response.indexOf(config.username) >= 0) {
    console.log('logged in as ' + response);
    return response;
  } else {
    return 'not logged in';
  }
}

function login() {
  return new Promise(function (resolve, reject) {
    execute('force active')
      .then(checkActiveUser, logError)
      .then(function () {
        resolve();
      }, function (error) {
        if (error === 'not logged in') {
          // Actually login
          execute('force login -u=' + config.username + ' -p=' + config.password + config.token)
            .then(function (response) {
              // Resolve the promise with the response (username info)
              resolve(response);
            });
        } else {
          // If error doesn't match what is expected, just pipe it to the next call.
          reject(error);
        }
      });
  });
}

