
describe('eyes.it', function () {
  beforeEach(() => {
    global.browser = {};
    global.fit = () => {};
  });

  it('should import eyes.it correctly - sanity', () => {
    var eyes = require('../index');
  });
});