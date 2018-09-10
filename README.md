### Why do I need this?

Easily integrate protractor with [eyes](https://applitools.com/) when using jasmine2 as testing framework. All you have to do is use `eyes.it` in your tests instead of `it` and it will run the test with screenshots sent to eyes after each `browser.get()` and at the end of the test.

### Installing

```sh
npm install --save-dev eyes.it
```

### Usage

Add environment variable with your eyes api key (key here is only example, get your own!):
```sh
export EYES_API_KEY=6QGH9IA5nkK1wRt60I1EWybFMWTJ2R1kcwu07y41lYh0LNWu3r
```

In your protractor tests:
```js
const eyes = require('eyes.it');

// or import in TS or JS ES6:
import eyes from 'eyes.it';

eyes.it('should run tests with eyes', () => {
    browser.get('/');
    $('input').sendKeys('123');
    $('button').click();
    expect($('span').text()).toBe('123');
});
```

You can set a default window size

```js
const eyes = require('eyes.it');

eyes.defaultWindowSize = {width: 1024, height: 768};

eyes.it('should run tests with eyes', () => {
    browser.get('/');
    $('input').sendKeys('123');
    $('button').click();
    expect($('span').text()).toBe('123');
});
```

Or set window size for a single spec

```js
const eyes = require('eyes.it');

eyes.it('should run tests with eyes', () => {
    browser.get('/');
    $('input').sendKeys('123');
    $('button').click();
    expect($('span').text()).toBe('123');
}, {width: 1024, height: 768});
```

In case you require more screenshots in addition to the default ones that happen after browser.get() and at the end of the test, you can always call `eyes.checkWindow(testName);` in your test on your own.

You can also use `eyes.fit` in case you need to use focused tests.

If you do not have `EYES_API_KEY` environment variable, `eyes.it` will behave just like regular `it`.

You can simulate an Applitools Github integration for pull requests (see [here](https://applitools.com/docs/topics/integrations/github-integration.html])), by adding an `APPLITOOLS_BATCH_ID` environment variable. `APPLITOOLS_BATCH_ID` should be the commit hash of the branch HEAD. This will be set as the batch id of tests.

For instance you can add this to you `package.json`:
```json
{
  "scripts": {
    "test": "APPLITOOLS_BATCH_ID=<your-HEAD-hash> yoshi test"
  }
}
```

If you are running with few browser instances, you can get all running tests grouped together by setting `process.env.EYES_BATCH_UUID = require('uuid').v4()'` in your grunt file (or other node process that runs the build), you can also define it as an environment variable (you have to make sure that each run will set a different value to distinguish between runs).
Notice this will not work if you're using the `APPLITOOLS_BATCH_ID` environment variable.
