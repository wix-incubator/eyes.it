import { eyes } from './eyes';
import { augmentEyes, ignoreEyesIt } from './eyes-augment';

const shouldAugment = process.env.EYES_API_KEY;

if (shouldAugment) {
  augmentEyes();
} else {
  ignoreEyesIt();
}

module.exports = eyes;
