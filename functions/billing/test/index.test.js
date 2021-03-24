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

const proxyquire = require('proxyquire');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const requestRetry = require('requestretry');
const assert = require('assert');
const sinon = require('sinon');

const cwd = path.join(__dirname, '..');

const PROJECT_NAME = process.env.GOOGLE_CLOUD_PROJECT;
const FF_CMD = 'functions-framework';
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

  await require('../').startBilling(pubsubMessage);
});

const handleLinuxFailures = async proc => {
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

describe('functions/billing tests', () => {
  describe('notifies Slack', () => {
    let ffProc;
    const PORT = 8080;
    const BASE_URL = `http://localhost:${PORT}`;

    before(() => {
      const ffProc = execPromise(
        `${FF_CMD} --target=notifySlack --signature-type=event --port ${PORT}`,
        {timeout: 1000, shell: true, cwd}
      );
    });

    after(async () => {
      await handleLinuxFailures(ffProc);
    });

    describe('functions_billing_slack', () => {
      it('should notify Slack when budget is exceeded', async () => {
        const jsonData = {costAmount: 500, budgetAmount: 400};
        const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
          'base64'
        );
        const pubsubMessage = {data: encodedData, attributes: {}};

        const response = await requestRetry({
          url: `${BASE_URL}/notifySlack`,
          method: 'POST',
          body: {data: pubsubMessage},
          retryDelay: 200,
          json: true,
        });

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(
          response.body,
          'Slack notification sent successfully'
        );
      });
    });
  });

  describe('disables billing', () => {
    let ffProc;
    const PORT = 8081;
    const BASE_URL = `http://localhost:${PORT}`;

    before(() => {
      const ffProc = execPromise(
        `${FF_CMD} --target=stopBilling --signature-type=event --port ${PORT}`,
        {timeout: 1000, shell: true, cwd}
      );
    });

    after(async () => {
      await handleLinuxFailures(ffProc);
    });

    describe('functions_billing_stop', () => {
      it('should disable billing when budget is exceeded', async () => {
        // Use functions framework to ensure sample follows GCF specification
        // (Invoking it directly works too, but DOES NOT ensure GCF compatibility)
        const jsonData = {costAmount: 500, budgetAmount: 400};
        const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
          'base64'
        );
        const pubsubMessage = {data: encodedData, attributes: {}};

        const response = await requestRetry({
          url: `${BASE_URL}/stopBilling`,
          method: 'POST',
          body: {data: pubsubMessage},
          retryDelay: 200,
          json: true,
        });

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.includes('Billing disabled'));
      });
    });
  });
});

describe('shuts down GCE instances', () => {
  describe('functions_billing_limit', () => {
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

      const googleapisMock = {
        compute: sinon.stub().returns(computeMock),
        options: sinon.stub().returns(),
      };

      // Run test
      const jsonData = {costAmount: 500, budgetAmount: 400};
      const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
        'base64'
      );
      const pubsubMessage = {data: encodedData, attributes: {}};

      const sample = proxyquire('../', {
        'googleapis/build/src/apis/compute': googleapisMock,
      }); // kokoro-allow-mock

      await sample.limitUse(pubsubMessage);

      assert.strictEqual(computeMock.instances.list.calledOnce, true);
      assert.ok(computeMock.instances.stop.calledOnce);
    });
  });
});
