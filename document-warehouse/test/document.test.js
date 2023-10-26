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

const confirmationCreate = 'Document Created';
const confirmationGet = 'Document Found';
const confirmationFound = 'Document Found';

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Document tests', () => {
  let projectNumber;
  let document;
  let documentId;
  const location = 'us';
  const userId =
    'user:kokoro-system-test@long-door-651.iam.gserviceaccount.com';
  const queryText = 'sample';

  async function getProjectNumber() {
    const projectId = await iamClient.getProjectId();
    const request = {name: `projects/${projectId}`};
    const project = await projectClient.getProject(request);
    const resources = project[0].name.toString().split('/');
    const projectNumber = resources[resources.length - 1];
    return projectNumber;
  }

  function getDocumentId() {
    const name = document.name;
    const ids = name.split('/');
    documentId = ids[ids.length - 1];
  }

  before(async () => {
    projectNumber = await getProjectNumber();
  });

  it('should create a document', async () => {
    const output = execSync(
      `node quickstart.js ${projectNumber} ${location} ${userId}`
    );
    document = JSON.parse(output.slice(confirmationCreate.length + 2))[0]
      .document;
    getDocumentId();

    assert(output.startsWith(confirmationCreate));
  });

  it('should successful get a document', async () => {
    const output = execSync(
      `node get-document.js ${projectNumber} ${location} ${documentId} ${userId}`
    );

    assert(output.startsWith(confirmationGet));
  });
  it('should search and find a document', async () => {
    const output = execSync(
      `node search-document.js ${projectNumber} ${location} ${userId} ${queryText}`
    );

    assert(output.startsWith(confirmationFound));
  });
});
