// Copyright 2021 Google LLC
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

// Note: this assumes the function is deployed to the target project.
// IF THE FUNCTION IS NOT DEPLOYED, THIS TEST WILL FAIL.

const assert = require('assert');
const pRetry = require('p-retry');
const compute = require('@google-cloud/compute');
const uuid = require('uuid').v4;

const computeProtos = compute.protos.google.cloud.compute.v1;
const instancesClient = new compute.InstancesClient();
const opsClient = new compute.ZoneOperationsClient();

const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let USER_NAME = gac ? require(gac).client_email : process.env.USER;
USER_NAME = USER_NAME.toLowerCase().replace(/\W/g, '_');

const PROJECT = process.env.GCLOUD_PROJECT;
const ZONE = 'us-central1-a';
const MACHINE_TYPE = 'n1-standard-1';

const instanceName = `gcf-test-${uuid()}`;

describe('functions_label_gce_instance', () => {
  before(async () => {
    // Create a Compute Engine instance
    const [response] = await instancesClient.insert({
      instanceResource: {
        name: instanceName,
        machineType: `zones/${ZONE}/machineTypes/${MACHINE_TYPE}`,
        disks: [
          {
            initializeParams: {
              diskSizeGb: '10',
              sourceImage:
                'projects/debian-cloud/global/images/family/debian-10',
            },
            boot: true,
            autoDelete: true,
            type: computeProtos.AttachedDisk.Type.PERSISTENT,
          },
        ],
        networkInterfaces: [{name: 'global/networks/default'}],
      },
      project: PROJECT,
      zone: ZONE,
    });

    // Wait for the create operation to complete.
    let operation = response;
    while (operation.status !== 'DONE') {
      const pollResponse = await opsClient.wait({
        operation: operation.name,
        project: PROJECT,
        zone: ZONE,
      });
      operation = pollResponse[0];
    }
  });

  it('should label an instance', async () => {
    await pRetry(
      async () => {
        // Check the instance's labels
        const [instance] = await instancesClient.get({
          project: PROJECT,
          zone: ZONE,
          instance: instanceName,
        });

        console.log(instance.labels);
        assert(instance.labels && instance.labels.creator);
        assert.equal(instance.labels.creator.includes(USER_NAME), true);

        // Signal completion
        return Promise.resolve();
      },
      {retries: 3}
    );
  });

  after(async () => {
    // Delete the created instance
    await instancesClient.delete({
      project: PROJECT,
      zone: ZONE,
      instance: instanceName,
    });
  });
});
