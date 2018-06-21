/* global fit it */
'use strict';

process.env.APPLITOOLS_BATCH_ID = getCommitHash();
var path = require('path');
var Eyes = require('eyes.selenium').Eyes;
var appName = require(path.join(process.cwd(), 'package.json')).name;
var eyes = new Eyes();

var eyesOpen = false;
var hooked = browser.get;
browser.get = function (address) {
  return hooked.apply(this, arguments).then(function (result) {
    const res = eyesOpen ? eyes.checkWindow('get ' + address) : Promise.resolve();
    return res.then(() => result);
  });
};

function getCommitHash () {
  try {
    var execSync = require('child_process').execSync;
    var hash = execSync('git rev-parse --verify HEAD');
    var parentHashes = execSync(`git rev-list --parents -n 1 ${hash.toString()}`);
    var hashes = parentHashes.toString().split(' ');
    var index = hashes.length === 3 ? 2 : 0;

    return hashes[index].trim();
  } catch (e) {
    return process.env.BUILD_VCS_NUMBER;
  }
}

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

    if (isPassedParameterArgument(arguments)) {
      var params = arguments[2];
      var width = params.width;
      var height = params.height;
      var version = params.version;

      // width or height of 0 will make the params window size to be ignored
      if (params.width && params.height) {
        windowSize = {width: params.width, height: params.height};
      }

      if (params.version) {
        specVersion = params.version;
      }

      delete arguments[2];
    }

    var spec = fn.apply(this, arguments);
    var hooked = spec.beforeAndAfterFns;
    spec.beforeAndAfterFns = function () {
      var result = hooked.apply(this, arguments);
      result.befores.unshift({fn: function (done) {
          eyesOpen = true;
          eyes.open(browser, appName, buildSpecName(spec, specVersion), windowSize).then(done);
        }, timeout: () => 30000});
      result.afters.unshift({fn: function(done) {
          eyesOpen = false;
          eyes
            .checkWindow('end')
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

function _init() {
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
  eyes.setBatch(null, process.env.APPLITOOLS_BATCH_ID, 0);
}

_init();

module.exports = eyes;
