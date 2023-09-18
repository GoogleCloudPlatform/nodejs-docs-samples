// Copyright 2023 Google LLC
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

'use strict';

const {describe, it} = require('mocha');
const assert = require('assert');
const cp = require('child_process');

const {PoliciesClient} = require('@google-cloud/iam').v2;
const {ProjectsClient} = require('@google-cloud/resource-manager').v3;
const iamClient = new PoliciesClient();
const projectClient = new ProjectsClient();

const confirmationCreate = 'Document Schema Created';
const confirmationDeleted = 'Document Schema Deleted';
const confirmationGet = 'Schema Found';

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Document schema tests', () => {
  let projectNumber;
  let documentSchema;
  let documentSchemaId;
  const location = 'us';

  async function getProjectNumber() {
    const projectId = await iamClient.getProjectId();
    const request = {name: `projects/${projectId}`};
    const project = await projectClient.getProject(request);
    const resources = project[0].name.toString().split('/');
    const projectNumber = resources[resources.length - 1];
    return projectNumber;
  }

  function getDocumentSchemaId() {
    const name = documentSchema.name;
    const ids = name.split('/');
    documentSchemaId = ids[ids.length - 1];
  }

  before(async () => {
    projectNumber = await getProjectNumber();
  });

  it('should create a document schema', async () => {
    const output = execSync(
      `node create-document-schema.js ${projectNumber} ${location}`
    );
    documentSchema = JSON.parse(output.slice(confirmationCreate.length + 2))[0];
    getDocumentSchemaId();

    assert(output.startsWith(confirmationCreate));
  });

  it('should get created document schema', async () => {
    const output = execSync(
      `node get-document-schema.js ${projectNumber} ${location} ${documentSchemaId}`
    );

    assert(output.startsWith(confirmationGet));
  });

  it('should delete a document schema', async () => {
    const output = execSync(
      `node delete-document-schema.js ${projectNumber} ${location} ${documentSchemaId}`
    );

    assert(output.startsWith(confirmationDeleted));
  });
});
