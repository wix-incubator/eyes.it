/* global fit it */
const path = require('path');
const uuid = require('uuid');
const Eyes = require('eyes.selenium').Eyes;

const appName = require(path.join(process.cwd(), 'package.json')).name;
const eyes = new Eyes();

let eyesOpen = false;
const originalBrowserGet = browser.get;
browser.get = function(address) {
  return originalBrowserGet.apply(this, arguments).then(function(result) {
    const res = eyesOpen
      ? eyes.checkWindow('get ' + address)
      : Promise.resolve();
    return res.then(() => result);
  });
};

function handleError(err, done) {
  fail(err);
  done();
}

function isPassedParameterArgument(argumentsObj) {
  return typeof argumentsObj[2] === 'object';
}

function eyesWithout(fn) {
  return function() {
    if (isPassedParameterArgument(arguments)) {
      delete arguments[2];
    }
    return fn.apply(this, arguments);
  };
}

function buildSpecName(spec, version) {
  const versionDescription = version ? ' version: ' + version : '';

  return 'eyes.it ' + spec.getFullName() + versionDescription;
}

function eyesWith(fn) {
  return function() {
    let windowSize = eyes.defaultWindowSize;
    let specVersion;

    if (isPassedParameterArgument(arguments)) {
      const params = arguments[2];

      // width or height of 0 will make the params window size to be ignored
      if (params.width && params.height) {
        windowSize = { width: params.width, height: params.height };
      }

      if (params.version) {
        specVersion = params.version;
      }

      delete arguments[2];
    }

    const spec = fn.apply(this, arguments);
    const hooked = spec.beforeAndAfterFns;
    spec.beforeAndAfterFns = function() {
      const result = hooked.apply(this, arguments);
      result.befores.unshift({
        fn: function(done) {
          eyesOpen = true;
          eyes
            .open(
              browser,
              appName,
              buildSpecName(spec, specVersion),
              windowSize,
            )
            .then(done);
        },
        timeout: () => 30000,
      });
      result.afters.unshift({
        fn: function(done) {
          eyesOpen = false;
          eyes
            .checkWindow('end')
            .then(() => eyes.close())
            .then(done)
            .catch(err => handleError(err, done));
        },
        timeout: () => 30000,
      });
      return result;
    };
    return spec;
  };
}

function getBatchUUID() {
  return process.env.EYES_BATCH_UUID;
}

function setOnceBatchUUID(batchUuid) {
  if (!getBatchUUID()) {
    process.env.EYES_BATCH_UUID = batchUuid;
  }
}

function _init() {
  setOnceBatchUUID(uuid.v4());
  let batchId = getBatchUUID();
  let batchName = appName;
  let batchStartAt = undefined;

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
