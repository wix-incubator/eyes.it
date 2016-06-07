/* global fit */
'use strict';

var Eyes = require('eyes.protractor').Eyes;
var eyes = new Eyes();
var path = require('path');

var appName = require(path.join(process.cwd(), 'package.json')).name;
var eyesOpen = false;
var hooked = browser.get;
browser.get = function (address) {
  return hooked.apply(this, arguments).then(function (result) {
    if (eyesOpen) {
      eyes.checkWindow('get ' + address);
    }
    return result;
  });
};

function eyesWith(fn) {
  return function () {
    var spec = fn.apply(this, arguments);
    var hooked = spec.beforeAndAfterFns;
    spec.beforeAndAfterFns = function () {
      var result = hooked.apply(this, arguments);
      result.befores.unshift({fn: function (done) {
        eyesOpen = true;
        eyes.open(browser, appName, 'eyes.it ' + spec.getFullName()).then(done);
      }, timeout: () => 30000});
      result.afters.unshift({fn: function (done) {
        eyesOpen = false;
        eyes.checkWindow('end');
        eyes.close().then(done);
      }, timeout: () => 30000});
      return result;
    };
    return spec;
  };
}

if (process.env.EYES_API_KEY) {
  eyes.setApiKey(process.env.EYES_API_KEY);
  eyes.it = eyesWith(it);
  eyes.fit = eyesWith(fit);
} else {
  eyes.it = it;
  eyes.fit = fit;
}

module.exports = eyes;
