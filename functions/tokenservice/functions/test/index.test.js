const assert = require('assert');
const index = require('../index.js');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const cwd = path.join(__dirname, '..');
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const FF_TIMEOUT = 3000;
let requestRetry = require('requestretry');

// let requestRetryForCredentials = require('requestretry');

const defaults = {
  uri: `${BASE_URL}/getOAuthToken`,
  maxAttempts: 1,
  fullResponse: true,
};

requestRetry = requestRetry.defaults({
  retryStrategy: requestRetry.RetryStrategies.NetworkError,
  method: 'GET',
  json: true,
  url: `${BASE_URL}/getOAuthToken`,
});

const contextValue = (uid = 'test-uid', email_verified = true) => ({
  auth: {
    uid,
    token: {
      firebase: {
        email_verified,
      },
    },
  },
});

describe('getOAuthToken tests', () => {
  let ffProc;
  before(() => {
    ffProc = execPromise(
      `functions-framework --target=getOAuthToken --signature-type=http`,
      {timeout: FF_TIMEOUT, shell: true, cwd}
    );
  });
  after(async () => {
    try {
      await ffProc;
    } catch (err) {
      // Timeouts always cause errors on Linux, so catch them
      if (err.name && err.name === 'ChildProcessError') {
        return;
      }
      throw err;
    }
  });

  describe('Firebase OAuth Token', () => {
    // no argument 400 error
    it('should give 400 if no Context is provided', async () => {
      //new requestRetry(defaults, (error, response, body) => done())
      const response = await requestRetry({
        body: {
          deviceID: '',
        },
      });
      //Context is missing in the input parameter.
      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(response.statusMessage, 'Bad Request');
    });

    it('should give 400 if no deviceID is provided', async () => {
      //new requestRetry(defaults, (error, response, body) => done())
      const response = await requestRetry({
        contextValue,
      });
      //Context is missing in the input parameter.
      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(response.statusMessage, 'Bad Request');
    });
  });
});
