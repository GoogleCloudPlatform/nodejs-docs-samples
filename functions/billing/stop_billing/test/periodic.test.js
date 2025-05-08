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

const {exec} = require('child_process');
const {request} = require('gaxios');
const assert = require('assert');
const promiseRetry = require('promise-retry');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

describe('functions_billing_limit', () => {
  let ffProc;
  before(async () => {
    console.log('Running periodic before hook....');
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
    console.log('Periodic before hook complete.');
  });

  after(() => {
    console.log('Ending functions-framework process...');
    ffProc.kill();
    console.log('functions-framework process stopped.');
  });

  it('should shut down GCE instances when budget is exceeded', async () => {
    console.log('Starting functions-framework process...');
    ffProc = exec(
      'npx functions-framework --target=limitUse --signature-type=event'
    );
    console.log('functions-framework process started and listening!');

    const jsonData = {costAmount: 500, budgetAmount: 400};
    const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
      'base64'
    );
    const pubsubMessage = {data: encodedData, attributes: {}};

    const response = await request({
      url: `${BASE_URL}/`,
      method: 'POST',
      data: {data: pubsubMessage},
      retryConfig: {
        retries: 3,
        retryDelay: 200,
      },
    });

    console.log(response.data);

    assert.strictEqual(response.status, 200);
    assert.ok(response.data.includes('instance(s) stopped successfully'));
  });
});
