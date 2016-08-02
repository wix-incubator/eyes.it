### Why do I need this?

Easily integrate protractor with eyes when using jasmine2 as testing framework. All you have to do is use `eyes.it` in your tests instead of `it` and it will run the test with screenshots sent to eyes after each `browser.get()` and at the end of the test.

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
let eyes = require('eyes.it');

eyes.it('should run tests with eyes', () => {
    browser.get('/');
    $('input').sendKeys('123');
    $('button').click();
    expect($('span').text()).toBe('123');
});
```

You can set a default window size

```js
let eyes = require('eyes.it');

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
let eyes = require('eyes.it');

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

