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
const sinon = require('sinon');
const waitPort = require('wait-port');
const {InstancesClient} = require('@google-cloud/compute');
const sample = require('../index.js');

const {BILLING_ACCOUNT} = process.env;

describe('functions/billing tests', () => {
  let projectId;
  before(async () => {
    const client = new InstancesClient();
    projectId = await client.getProjectId();
  });
  after(async () => {
    // Re-enable billing using the sample file itself
    // Invoking the file directly is more concise vs. re-implementing billing setup here
    const jsonData = {
      billingAccountName: `billingAccounts/${BILLING_ACCOUNT}`,
      projectName: `projects/${projectId}`,
    };
    const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
      'base64'
    );
    const pubsubMessage = {data: encodedData, attributes: {}};
    await require('../').startBilling(pubsubMessage);
  });

  describe('notifies Slack', () => {
    let ffProc;
    const PORT = 8080;
    const BASE_URL = `http://localhost:${PORT}`;

    before(async () => {
      console.log('Starting functions-framework process...');
      ffProc = exec(
        `npx functions-framework --target=notifySlack --signature-type=event --port ${PORT}`
      );
      await waitPort({host: 'localhost', port: PORT});
      console.log('functions-framework process started and listening!');
    });

    after(() => {
      console.log('Ending functions-framework process...');
      ffProc.kill();
      console.log('functions-framework process stopped.');
    });

    describe('functions_billing_slack', () => {
      it('should notify Slack when budget is exceeded', async () => {
        const jsonData = {costAmount: 500, budgetAmount: 400};
        const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
          'base64'
        );
        const pubsubMessage = {data: encodedData, attributes: {}};

        const response = await request({
          url: `${BASE_URL}/notifySlack`,
          method: 'POST',
          data: {data: pubsubMessage},
        });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(
          response.data,
          'Slack notification sent successfully'
        );
      });
    });
  });

  describe('disables billing', () => {
    let ffProc;
    const PORT = 8081;
    const BASE_URL = `http://localhost:${PORT}`;

    before(async () => {
      console.log('Starting functions-framework process...');
      ffProc = exec(
        `npx functions-framework --target=stopBilling --signature-type=event --port ${PORT}`
      );
      await waitPort({host: 'localhost', port: PORT});
      console.log('functions-framework process started and listening!');
    });

    after(() => {
      console.log('Ending functions-framework process...');
      ffProc.kill();
      console.log('functions-framework process stopped.');
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

        const response = await request({
          url: `${BASE_URL}/stopBilling`,
          method: 'POST',
          data: {data: pubsubMessage},
        });

        assert.strictEqual(response.status, 200);
        assert.ok(response.data.includes('Billing disabled'));
      });
    });
  });

  describe('shuts down GCE instances', () => {
    describe('functions_billing_limit', () => {
      it('should attempt to shut down GCE instances when budget is exceeded', async () => {
        const jsonData = {costAmount: 500, budgetAmount: 400};
        const encodedData = Buffer.from(JSON.stringify(jsonData)).toString(
          'base64'
        );
        const pubsubMessage = {data: encodedData, attributes: {}};
        // Mock GCE (because real GCE instances take too long to start/stop)
        const instances = [{name: 'test-instance-1', status: 'RUNNING'}];
        const listStub = sinon
          .stub(sample.getInstancesClient(), 'list')
          .resolves([instances]);
        const stopStub = sinon
          .stub(sample.getInstancesClient(), 'stop')
          .resolves({});
        await sample.limitUse(pubsubMessage);
        assert.strictEqual(listStub.calledOnce, true);
        assert.ok(stopStub.calledOnce);
      });
    });
  });
});
