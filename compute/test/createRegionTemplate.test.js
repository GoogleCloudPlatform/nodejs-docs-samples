/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const {assert, expect} = require('chai');
const {before, after, describe, it} = require('mocha');
const cp = require('child_process');
const {RegionInstanceTemplatesClient} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create region instance template', async () => {
  const templateName = 'region-template-name';
  const region = 'us-central1';
  const regionInstanceTemplatesClient = new RegionInstanceTemplatesClient();
  let projectId;

  before(async () => {
    projectId = await regionInstanceTemplatesClient.getProjectId();
  });

  after(async () => {
    await regionInstanceTemplatesClient.delete({
      project: projectId,
      instanceTemplate: templateName,
      region,
    });
  });

  it('should create a new template', () => {
    const networkInterface = {
      name: 'nic0',
      network: `https://www.googleapis.com/compute/v1/projects/${projectId}/global/networks/default`,
    };
    const disk = {
      sourceImage:
        'projects/debian-cloud/global/images/debian-12-bookworm-v20240815',
      diskSizeGb: '100',
      diskType: 'pd-balanced',
    };

    const response = JSON.parse(
      execSync('node ./create-instance-templates/createRegionTemplate.js', {
        cwd,
      })
    );

    assert.equal(response.name, templateName);
    assert.equal(
      response.region,
      `https://www.googleapis.com/compute/v1/projects/${projectId}/regions/${region}`
    );
    expect(response.properties.networkInterfaces[0]).includes(networkInterface);
    expect(response.properties.disks[0].initializeParams).includes(disk);
  });
});
