/* global fit it */
'use strict';

var path = require('path');
var uuid = require('uuid');
var Eyes = require('eyes.selenium').Eyes;
var appName = require(path.join(process.cwd(), 'package.json')).name;
var eyes = new Eyes();

var originalBrowserGet = browser.get;

function handleError(err, done) {
  fail(err);
  done();
}

function isPassedParameterArgument(argumentsObj) {
  return typeof argumentsObj[2] === 'object';
}

function eyesWithout(fn) {
  return function () {
    if (isPassedParameterArgument(arguments)) {
      delete arguments[2];
    }
    return fn.apply(this, arguments);
  };
}


function buildSpecName(spec, version) {
  var versionDescription = version ? ' version: ' + version : '';

  return 'eyes.it ' + spec.getFullName() + versionDescription;
}

function eyesWith(fn) {
  return function () {
    var windowSize = eyes.defaultWindowSize;
    var specVersion;
    var enableSnapshotAtEnd;
    var enableSnapshotAtBrowserGet;

    if (isPassedParameterArgument(arguments)) {
      var params = arguments[2];
      var width = params.width;
      var height = params.height;
      var version = params.version;
      enableSnapshotAtEnd = params.enableSnapshotAtEnd === undefined ? true : params.enableSnapshotAtEnd;
      enableSnapshotAtBrowserGet = params.enableSnapshotAtBrowserGet === undefined ? true : params.enableSnapshotAtBrowserGet;

      // width or height of 0 will make the params window size to be ignored
      if (params.width && params.height) {
        windowSize = {width: params.width, height: params.height};
      }

      if (params.version) {
        specVersion = params.version;
      }

      delete arguments[2];
    }

    var eyesOpen = false;
    
    if (enableSnapshotAtBrowserGet) {
      browser.get = function (address) {
        return originalBrowserGet.apply(this, arguments).then(function (result) {
          const res = eyesOpen ? eyes.checkWindow('get ' + address) : Promise.resolve();
          return res.then(() => result);
        });
      };
    } else {
      browser.get = originalBrowserGet;
    }

    var spec = fn.apply(this, arguments);
    var hooked = spec.beforeAndAfterFns;
    spec.beforeAndAfterFns = function () {
      var result = hooked.apply(this, arguments);
      result.befores.unshift({
        fn: function (done) {
          eyesOpen = true;
          eyes.open(browser, appName, buildSpecName(spec, specVersion), windowSize).then(done);
        }, timeout: () => 30000
      });
      result.afters.unshift(
        {
          fn: function (done) {
            eyesOpen = false;
            Promise.resolve()
              .then(() => {
                if (enableSnapshotAtEnd) {
                  return eyes.checkWindow('end');
                }
              })
              .then(() => eyes.close())
              .then(done)
              .catch(err => handleError(err, done));
          },
          timeout: () => 30000
        });
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
  var batchId = getBatchUUID();
  var batchName = appName;
  var batchStartAt = undefined;

  if (process.env.APPLITOOLS_BATCH_ID) {
    batchId = process.env.APPLITOOLS_BATCH_ID;
    batchName = null;
    batchStartAt = 0;
  }

  if (process.env.EYES_API_KEY) {
    eyes.setApiKey(process.env.EYES_API_KEY);
    eyes.it = eyesWith(it);
    eyes.fit = eyesWith(fit);
  } else {
    eyes.it = eyesWithout(it);
    eyes.fit = eyesWithout(fit);
    eyes.checkWindow = () => Promise.resolve();
  }

  eyes.defaultWindowSize = null;
  eyes.setBatch(batchName, batchId, batchStartAt);
}

_init();

module.exports = eyes;
