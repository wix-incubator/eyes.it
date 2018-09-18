import { eyes } from './eyes';
import { hookEyesIt, ignoreEyesIt } from './eyes-hook';

const shouldHook = process.env.EYES_API_KEY;

if (shouldHook) {
  hookEyesIt(browser);
} else {
  ignoreEyesIt();
}

module.exports = eyes;
