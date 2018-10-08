/**
 * This is actually not an integration test, it is a unit-test.
 * We only use the e2e suffix so that the default jasmine glob catchs this file.
 */

// Importing `../src/eyes` and not `../src`, since we don't want yet to initialize with `hookEyesIt()`.
import { eyes } from '../src/eyes';
import { augmentEyes } from '../src/eyes-augment';

// This log array is filled by the mock functions, and asserted on after each test.
let logs = [];
function log(msg) {
  logs.push(msg);
}

// Mocking `browser.get` needs to be done before calling `hookEyesIt()`.
const originalBrowserGet = browser.get;
browser.get = () => {
  log('browser_get');
  return Promise.resolve();
};

// Now that `browser.get` is mocked, we can augment eyes
augmentEyes();

/** Mocks */
const originalEyesOpen = eyes.open;
eyes.open = (browser, appName, specName, windowSize) => {
  log(`open(${specName})`);
  return Promise.resolve();
};

const originalEyesCheckWindow = eyes.checkWindow;
eyes.checkWindow = msg => {
  log(`checkWindow(${msg}}`);
  return Promise.resolve();
};

const originalEyesClose = eyes.close;
eyes.close = () => {
  log(`close`);
  return Promise.resolve();
};
/* Mocks END */

const STUB_URL = 'http://blah.com';

/* Matchers */
const OPEN = /^open/;
const BROWSER_GET = /^browser_get/;
const CHECK_WINDOW = /^checkWindow/;
const DO_SOMETHING = /^do_something/;
const CLOSE = /^close/;

function doSomething() {
  log('do_something');
  return Promise.resolve();
}

function finalizeAndExpect(logMatchers) {
  expect(logMatchers.length).toEqual(logs.length, 'boo'); // eslint-disable-line jest/prefer-to-have-length
  logMatchers.forEach((matcher, index) => {
    expect(logs[index]).toEqual(jasmine.stringMatching(matcher));
  });
  logs = [];
}

describe('eyes.it', () => {
  afterAll(() => {
    // Revert mocks
    browser.get = originalBrowserGet;
    eyes.open = originalEyesOpen;
    eyes.close = originalEyesClose;
    eyes.checkWindow = originalEyesCheckWindow;
  });

  describe('should create snapshot at end and browser.get', () => {
    eyes.it('', async () => {
      await browser.get(STUB_URL);
      await doSomething();
    });
    afterAll(() => {
      finalizeAndExpect([
        OPEN,
        BROWSER_GET,
        CHECK_WINDOW,
        DO_SOMETHING,
        CHECK_WINDOW,
        CLOSE,
      ]);
    });
  });

  describe('should not open eyes', () => {
    it('', async () => {
      await browser.get(STUB_URL);
    });
    afterAll(() => {
      finalizeAndExpect([BROWSER_GET]);
    });
  });

  describe('should NOT create any snapshots', () => {
    eyes.it(
      '',
      async () => {
        await doSomething();
      },
      {
        enableSnapshotAtBrowserGet: false,
        enableSnapshotAtEnd: false,
      },
    );
    afterAll(() => {
      finalizeAndExpect([OPEN, DO_SOMETHING, CLOSE]);
    });
  });

  describe('should NOT create snapshot at end', () => {
    eyes.it(
      '',
      async () => {
        await doSomething();
      },
      {
        enableSnapshotAtEnd: false,
      },
    );
    afterAll(() => {
      finalizeAndExpect([OPEN, DO_SOMETHING, CLOSE]);
    });
  });

  describe('should create snapshot on browser.get inside beforeEach ', () => {
    beforeEach(async () => {
      await browser.get(STUB_URL);
    });
    eyes.it(
      '',
      async () => {
        await doSomething();
      },
      {
        enableSnapshotAtEnd: false,
      },
    );
    afterAll(() => {
      finalizeAndExpect([OPEN, BROWSER_GET, CHECK_WINDOW, DO_SOMETHING, CLOSE]);
    });
  });

  describe('should create snapshot on browser.get inside it ', () => {
    eyes.it(
      '',
      async () => {
        await doSomething();
        await browser.get(STUB_URL);
      },
      {
        enableSnapshotAtEnd: false,
      },
    );
    afterAll(() => {
      finalizeAndExpect([OPEN, DO_SOMETHING, BROWSER_GET, CHECK_WINDOW, CLOSE]);
    });
  });

  describe('should create snapshot in afterEach block', () => {
    eyes.it(
      '',
      async () => {
        await browser.get(STUB_URL);
        await doSomething();
      },
      {
        enableSnapshotAtBrowserGet: false,
        enableSnapshotAtEnd: false,
      },
    );

    afterEach(() => {
      eyes.checkWindow('blah');
    });

    afterAll(() => {
      finalizeAndExpect([OPEN, BROWSER_GET, DO_SOMETHING, CHECK_WINDOW, CLOSE]);
    });
  });

  describe('should create snapshot at End, before afterEach block', () => {
    eyes.it(
      '',
      async () => {
        await browser.get(STUB_URL);
        await doSomething();
      },
      {
        enableSnapshotAtBrowserGet: false,
      },
    );

    afterEach(async () => {
      await doSomething();
    });

    afterAll(() => {
      finalizeAndExpect([
        OPEN,
        BROWSER_GET,
        DO_SOMETHING,
        CHECK_WINDOW,
        DO_SOMETHING,
        CLOSE,
      ]);
    });
  });

  describe('should open eyes with specName and version', () => {
    eyes.it('my spec', async () => {}, {
      enableSnapshotAtBrowserGet: false,
      enableSnapshotAtEnd: false,
      version: '1.0.0',
    });

    afterAll(() => {
      finalizeAndExpect([
        /^open\(eyes\.it eyes\.it should open eyes with specName and version my spec version: 1\.0\.0\)/,
        CLOSE,
      ]);
    });
  });
});
