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

const execPromise = require('child-process-promise').exec;
const path = require('path');
const requestRetry = require('requestretry');
const assert = require('assert');

const promiseRetry = require('promise-retry');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const cwd = path.join(__dirname, '..');

before(async () => {
  // Re-enable compute instances using the sample file itself
  const {startInstances, listRunningInstances} = require('../');

  const emptyJson = JSON.stringify({});
  const encodedData = Buffer.from(emptyJson).toString('base64');
  const emptyMessage = {data: encodedData, attributes: {}};

  await startInstances(emptyMessage);

  try {
    await promiseRetry(
      async (retry, n) => {
        const result = await listRunningInstances(emptyMessage);

        console.log(`${n}: ${result}`);
        if (result.length > 0) {
          return Promise.resolve();
        } else {
          return retry();
        }
      },
      {retries: 8}
    );
  } catch (err) {
    console.error('Failed to restart GCE instances:', err);
  }
});

describe('functions_billing_limit', () => {
  it('should shut down GCE instances when budget is exceeded', async () => {
    const ffProc = execPromise(
      'functions-framework --target=limitUse --signature-type=event',
      {timeout: 1000, shell: true, cwd}
    );

    const jsonData = {costAmount: 500, budgetAmount: 400};
    const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
      'base64'
    );
    const pubsubMessage = {data: encodedData, attributes: {}};

    const response = await requestRetry({
      url: `${BASE_URL}/`,
      method: 'POST',
      body: {data: pubsubMessage},
      retryDelay: 200,
      json: true,
    });

    // Wait for the functions framework to stop
    // Must be BEFORE assertions, in case they fail
    await ffProc;

    console.log(response.body);

    assert.strictEqual(response.statusCode, 200);
    assert.ok(response.body.includes('instance(s) stopped successfully'));
  });
});
