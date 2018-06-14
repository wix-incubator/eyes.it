'use strict';

const {eyes} = require('./eyes');
const {hookEyesIt, ignoreEyesIt} = require('./eyes-hook');

const shouldHook = process.env.EYES_API_KEY;

if (shouldHook) {
  hookEyesIt();
} else {
  ignoreEyesIt();
}

module.exports = eyes;
