/**
 * Copyright 2017, Google, Inc.
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

'use strict';

const proxyquire = require(`proxyquire`).noPreserveCache();
const sinon = require(`sinon`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);

const monitoring = proxyquire(`@google-cloud/monitoring`, {});
const client = new monitoring.MetricServiceClient();

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it(`should list time series`, async () => {
  const clientMock = {
    projectPath: projectId => client.projectPath(projectId),
    createTimeSeries: async _request => {
      _request.name = client.projectPath(process.env.GCLOUD_PROJECT);
      _request.timeSeries[0].resource.labels.project_id =
        process.env.GCLOUD_PROJECT;

      const result = await client.createTimeSeries(_request);
      setTimeout(() => {
        try {
          assert.strictEqual(console.log.callCount, 1);
          assert.deepStrictEqual(console.log.getCall(0).args, [
            `Done writing time series data.`,
            {},
          ]);
        } catch (err) {}
      }, 200);

      return result;
    },
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/monitoring': {
      MetricServiceClient: sinon.stub().returns(clientMock),
    },
  });
});
