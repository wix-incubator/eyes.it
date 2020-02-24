import eyes from '../src';
import { MockServer } from './mockServer';

describe('eyes.it', function() {
  let server = new MockServer();

  beforeEach(() => {
    server.start();
  });

  afterEach(() => {
    server.stop();
  });

  eyes.it('should not throw error', async () => {
    // // fixes protractor angular related exception: See http://git.io/v4gXM for details.
    // browser.ignoreSynchronization = true;
    browser.waitForAngularEnabled(false);
    await browser.get(`${MockServer.URI}/`);
  });
});
