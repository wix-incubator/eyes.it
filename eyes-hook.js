'use strict';
const merge = require('lodash.merge');
const {eyes} = require('./eyes');
const eyesIt = require('./eyes-it.js');

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

function extractArguments(args) {
  const config = {};

  if (isPassedParameterArgument(args)) {
    var params = args[2];

    // width or height of 0 will make the params window size to be ignored
    if (params.width && params.height) {
      config.windowSize = {width: params.width, height: params.height};
    }
    
    if (params.version) {
      config.specVersion = params.version;
    }

    if (params.enableSnapshotAtEnd !== undefined) {
      config.enableSnapshotAtEnd = params.enableSnapshotAtEnd;
    }

    if (params.enableSnapshotAtBrowserGet !== undefined) {
      config.enableSnapshotAtBrowserGet = params.enableSnapshotAtBrowserGet;
    }

    delete args[2];
  }

  return config;
}

function eyesWith(fn, config) {
  return function () {
    const configFromArgs = extractArguments(arguments);
    return eyesIt(fn, arguments,  merge({}, config, configFromArgs));
  };
}

function hookEyesIt() {
  eyes.it = eyesWith(it);
  eyes.fit = eyesWith(fit);
}

/**
 * Removes eyes.it 3rd argument to `it` funtion.
 */
function ignoreEyesIt() {
  eyes.it = eyesWithout(it);
  eyes.fit = eyesWithout(fit);
}

module.exports = {hookEyesIt, ignoreEyesIt};