'use strict';

var path = require('path');
var uuid = require('uuid');
var Eyes = require('eyes.selenium').Eyes;
var appName = require(path.join(process.cwd(), 'package.json')).name;

var eyes = new Eyes();

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
  } else {
    // mock eyes function which throw error when Api key not set
    eyes.checkWindow = () => Promise.resolve();
    eyes.checkRegionBy = () => Promise.resolve();
    eyes.checkRegionByElement = () => Promise.resolve();
    eyes.checkRegion = () => Promise.resolve();
    eyes.open = () => Promise.resolve();
    eyes.close = () => Promise.resolve();
  }
  
  eyes.defaultWindowSize = null;
  eyes.setBatch(batchName, batchId, batchStartAt);
}

_init();

module.exports = {eyes, appName};
