import eyes from '../src';
import { browser } from 'protractor';

describe('Real eyes test', () => {
  eyes.it('should take snapshot at browser.get and at end', async () => {
    await browser.get('http://localhost:3000');
  });
});
