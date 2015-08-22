/* global Promise */
module.exports = function logit(msg) {
  return new Promise(function (resolve, reject) {
    console.log(msg);
    msg.indexOf('error') < 0 ? resolve(msg) : reject(msg);
  });
}