/**
 * Copyright 2019, Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const googleapis = require('googleapis');
const proxyquire = require('proxyquire');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const requestRetry = require('requestretry');
const assert = require('assert');

const sinon = require('sinon');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const cwd = path.join(__dirname, '..');

const PROJECT_NAME = process.env.GCP_PROJECT;

const {BILLING_ACCOUNT} = process.env;

after(async () => {
  // Re-enable billing using the sample file itself
  // Invoking the file directly is more concise vs. re-implementing billing setup here
  const jsonData = {
    billingAccountName: `billingAccounts/${BILLING_ACCOUNT}`,
    projectName: `projects/${PROJECT_NAME}`,
  };
  const encodedData = Buffer.from(JSON.stringify(jsonData)).toString('base64');
  const pubsubMessage = {data: encodedData, attributes: {}};

  console.log(`Attempting to set PROJECT_NAME: ${PROJECT_NAME}`);

  await require('../').startBilling(pubsubMessage);
});

describe('functions/billing tests', () => {
  it('should notify Slack when budget is exceeded', async () => {
    // Use functions framework to ensure sample follows GCF specification
    // (Invoking it directly works too, but DOES NOT ensure GCF compatibility)
    const ffProc = execPromise(
      `functions-framework --target=notifySlack --signature-type=event`,
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
    try {
      await ffProc;
    } catch (err) {
      // Timeouts always cause errors on Linux, so catch them
      if (!err.name || err.name !== 'ChildProcessError') {
        throw err;
      }
    }

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, 'Slack notification sent successfully');
  });

  it('should disable billing when budget is exceeded', async () => {
    // Use functions framework to ensure sample follows GCF specification
    // (Invoking it directly works too, but DOES NOT ensure GCF compatibility)
    const ffProc = execPromise(
      `functions-framework --target=stopBilling --signature-type=event`,
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
    try {
      await ffProc;
    } catch (err) {
      // Timeouts always cause errors on Linux, so catch them
      if (!err.name || err.name !== 'ChildProcessError') {
        throw err;
      }
    }

    assert.strictEqual(response.statusCode, 200);
    assert.ok(response.body.includes('Billing disabled'));
  });

  it('should attempt to shut down GCE instances when budget is exceeded', async () => {
    // Mock GCE (because real GCE instances take too long to start/stop)
    const listInstancesResponseMock = {
      data: {
        items: [{name: 'test-instance-1', status: 'RUNNING'}],
      },
    };

    const computeMock = {
      instances: {
        list: sinon.stub().returns(listInstancesResponseMock),
        stop: sinon.stub().resolves({data: {}}),
      },
    };

    const googleapisMock = Object.assign({}, googleapis);
    googleapisMock.google.compute = sinon.stub().returns(computeMock);

    // Run test
    const jsonData = {costAmount: 500, budgetAmount: 400};
    const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
      'base64'
    );
    const pubsubMessage = {data: encodedData, attributes: {}};

    const sample = proxyquire('../', {googleapis: googleapisMock}); // kokoro-allow-mock

    await sample.limitUse(pubsubMessage);

    assert.strictEqual(computeMock.instances.list.calledOnce, true);
    assert.ok(computeMock.instances.stop.calledOnce);
  });
});
