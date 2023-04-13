// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict';

const {assert} = require('chai');
const cp = require('child_process');
const {describe, it, before} = require('mocha');
const sd = require('@google-cloud/service-directory');
const {v4} = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const registrationServiceClient = new sd.RegistrationServiceClient();
const projectId = process.env.GCLOUD_PROJECT;
const locationId = 'us-central1';
const uniqueRunId = v4();

describe('Service Directory Samples', () => {
  const namespaceId = `namespace-${uniqueRunId}`;
  const namespaceName = registrationServiceClient.namespacePath(
    projectId,
    locationId,
    namespaceId
  );
  const serviceId = 'test-service';
  const serviceName = registrationServiceClient.servicePath(
    projectId,
    locationId,
    namespaceId,
    serviceId
  );
  const endpointId = 'test-endpoint';
  const endpointName = registrationServiceClient.endpointPath(
    projectId,
    locationId,
    namespaceId,
    serviceId,
    endpointId
  );

  before(async () => {
    if (!projectId) {
      throw new Error('missing GCLOUD_PROJECT!');
    }
  });

  it('should create a namespace', async () => {
    const output = execSync(
      `node createNamespace ${projectId} ${locationId} ${namespaceId}`
    );
    assert.match(output, new RegExp(`Created namespace: ${namespaceName}`));
  });

  it('should create a service', async () => {
    const output = execSync(
      `node createService ${projectId} ${locationId} ${namespaceId} ${serviceId}`
    );
    assert.match(output, new RegExp(`Created service: ${serviceName}`));
  });

  it('should create an endpoint', async () => {
    const output = execSync(
      `node createEndpoint ${projectId} ${locationId} ${namespaceId} ${serviceId} ${endpointId}`
    );
    assert.match(output, new RegExp(`Created endpoint: ${endpointName}`));
  });

  it('should resolve service', async () => {
    const output = execSync(
      `node resolveService ${projectId} ${locationId} ${namespaceId} ${serviceId}`
    );
    assert.match(output, new RegExp(`Resolved service: ${serviceName}`));
  });

  it('should delete an endpoint', async () => {
    const output = execSync(
      `node deleteEndpoint ${projectId} ${locationId} ${namespaceId} ${serviceId} ${endpointId}`
    );
    assert.match(output, new RegExp(`Deleted endpoint: ${endpointName}`));
  });

  it('should delete a service', async () => {
    const output = execSync(
      `node deleteService ${projectId} ${locationId} ${namespaceId} ${serviceId}`
    );
    assert.match(output, new RegExp(`Deleted service: ${serviceName}`));
  });

  it('should delete a namespace', async () => {
    const output = execSync(
      `node deleteNamespace ${projectId} ${locationId} ${namespaceId}`
    );
    assert.match(output, new RegExp(`Deleted namespace: ${namespaceName}`));
  });
});
