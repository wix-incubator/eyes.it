const { eyes, appName } = require('./eyes');
const merge = require('lodash.merge');

function buildSpecName(spec, version) {
  const versionDescription = version ? ' version: ' + version : '';

  return 'eyes.it ' + spec.getFullName() + versionDescription;
}

function handleError(err, done) {
  fail(err);
  done();
}

let _enableSnapshotAtBrowserGet = false;
function init() {
  const originalBrowserGet = browser.get;

  browser.get = function(address) {
    return originalBrowserGet.apply(this, arguments).then(function(result) {
      const res = _enableSnapshotAtBrowserGet
        ? eyes.checkWindow('get ' + address)
        : Promise.resolve();
      return res.then(() => result);
    });
  };
}
const defaultConfig = {
  windowSize: eyes.defaultWindowSize,
  enableSnapshotAtEnd: true,
  enableSnapshotAtBrowserGet: true,
};

/**
 * Call original `it` and modify before and after
 *
 * @param {*} _it the original `it` or `fit` function
 * @param {*} _itArgs the original arguments of the original `it` or `fit` function.
 * @param {*} config `eyes.it` configuration
 * @returns spec
 */
function eyesIt(_it, _itArgs, config) {
  const {
    windowSize,
    specVersion,
    enableSnapshotAtBrowserGet,
    enableSnapshotAtEnd,
  } = merge({}, defaultConfig, config);

  const spec = _it.apply(this, _itArgs);
  const hooked = spec.beforeAndAfterFns;
  spec.beforeAndAfterFns = function() {
    //TODO: are we sure that we need to pass args (msg, itFn) to hooked?
    const result = hooked.apply(this, _itArgs);
    result.befores.unshift({
      fn: function(done) {
        _enableSnapshotAtBrowserGet = enableSnapshotAtBrowserGet;
        eyes
          .open(browser, appName, buildSpecName(spec, specVersion), windowSize)
          .then(done);
      },
      timeout: () => 30000,
    });
    result.afters.unshift({
      fn: function(done) {
        _enableSnapshotAtBrowserGet = false;
        Promise.resolve()
          .then(() => {
            if (enableSnapshotAtEnd) {
              return eyes.checkWindow('end');
            }
          })
          .then(done)
          .catch(err => handleError(err, done));
      },
      timeout: () => 30000,
    });

    result.afters.push({
      fn: function(done) {
        eyes
          .close()
          .then(done)
          .catch(err => handleError(err, done));
      },
      timeout: () => 30000,
    });
    return result;
  };
  return spec;
}

module.exports = { eyesIt, init };
