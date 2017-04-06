/* global fit it */
'use strict';

var path = require('path');
var uuid = require('uuid');
var Eyes = require('eyes.protractor').Eyes;
var appName = require(path.join(process.cwd(), 'package.json')).name;
var eyes = new Eyes();

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

function handleError(err, done) {
  fail(err);
  done();
}

function isPassedWindowSizeArgument(argumentsObj) {
  return typeof argumentsObj[2] === 'object'
}

function eyesWithout(fn) {
  return function () {
    if (isPassedWindowSizeArgument(arguments)) {
      delete arguments[2];
    }
    return fn.apply(this, arguments);
  }
}

function eyesWith(fn) {
  return function () {
    var windowSize = eyes.defaultWindowSize;
    if (isPassedWindowSizeArgument(arguments)) {
      windowSize = arguments[2];
      delete arguments[2];
    }
    var spec = fn.apply(this, arguments);
    var hooked = spec.beforeAndAfterFns;
    spec.beforeAndAfterFns = function () {
      var result = hooked.apply(this, arguments);
      result.befores.unshift({fn: function (done) {
        eyesOpen = true;
        eyes.open(browser, appName, 'eyes.it ' + spec.getFullName(), windowSize).then(done);
      }, timeout: () => 30000});
      result.afters.unshift({fn: function (done) {
        eyesOpen = false;
        eyes.checkWindow('end');
        eyes.close().then(done).catch(err => handleError(err, done));
      }, timeout: () => 30000});
      return result;
    };
    return spec;
  };
}

function getBatchUUID() {
  return process.env.EYES_BATCH_UUID;
}

function setOnceBatchUUID(uuid) {
  if (!getBatchUUID()) {
    process.env.EYES_BATCH_UUID = uuid;
  }
}

function _init() {
  setOnceBatchUUID(uuid.v4());

  if (process.env.EYES_API_KEY) {
    eyes.setApiKey(process.env.EYES_API_KEY);
    eyes.it = eyesWith(it);
    eyes.fit = eyesWith(fit);
  } else {
    eyes.it = eyesWithout(it);
    eyes.fit = eyesWithout(fit);
  }

  eyes.defaultWindowSize = null;
  eyes.setBatch(appName, getBatchUUID());
}

_init();

module.exports = eyes;
