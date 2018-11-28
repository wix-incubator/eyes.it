import { eyes } from './eyes';
import { augmentEyes, ignoreEyesIt } from './eyes-augment';

const shouldAugment = process.env.EYES_API_KEY;

if (shouldAugment) {
  augmentEyes();
} else {
  ignoreEyesIt();
}

/**
 * Create an instance of eyes.it with a default configure options.
 * All instances share the same eyes singleton which is already initialized.
 */
export function eyesItInstance(config) {
  /* eslint-disable no-restricted-globals */
  return new Proxy(eyes, {
    /* eslint-enable no-restricted-globals */
    get: (obj, prop) => {
      if (prop === 'it' || prop === 'fit') {
        return (msg, f) => obj[prop](msg, f, config);
      }
      return obj[prop];
    },
  });
}

export default eyes;
