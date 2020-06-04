// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-env node, mocha */

const assert = require('assert');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const cwd = path.join(__dirname, '..');
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const FF_TIMEOUT = 3000;
const PORT = 8080;
let requestRetry = require('requestretry');

requestRetry = requestRetry.defaults({
  retryDelay: 500,
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

const handleLinuxFailures = async (proc) => {
  try {
    return await proc;
  } catch (err) {
    // Timeouts always cause errors on Linux, so catch them
    // Don't return proc, as await-ing it re-throws the error
    if (!err.name || err.name !== 'ChildProcessError') {
      throw err;
    }
  }
};

describe('getOAuthToken tests', () => {
  let ffProc;
  before(() => {
    ffProc = execPromise(
      `functions-framework --target=getOAuthToken --signature-type=http --port=${PORT}`,
      {timeout: FF_TIMEOUT, shell: true, cwd}
    );
  });

  after(async () => {
    await handleLinuxFailures(ffProc);
  });

  describe('function_get_token Firebase OAuth Token', () => {
    // no argument 400 error
    it('should give 400 if no Context is provided', async () => {
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
      const response = await requestRetry({
        contextValue,
      });
      //Context is missing in the input parameter.
      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(response.statusMessage, 'Bad Request');
    });
  });
});

describe('generate_token retrieve_credentials save_token_to_firebase validate_token', () => {
  // Whitelist these region tags with the region-tag enforcer
});
