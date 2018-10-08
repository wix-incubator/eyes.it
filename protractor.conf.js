import { browser } from 'protractor';
import { serverStart, serverStop } from './test/httpServer';

module.exports.config = {
  specs: ['test/**/*.e2e.js'],
  beforeLaunch: function() {
    return serverStart();
  },
  onPrepare: function() {
    browser.ignoreSynchronization = true;
  },
  afterLaunch: function() {
    return serverStop();
  },
};
