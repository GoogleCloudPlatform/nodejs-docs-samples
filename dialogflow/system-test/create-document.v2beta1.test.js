// Copyright 2020 Google LLC
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

'use strict';
/**
 * TODO(developer): Uncomment the following lines until proto updates for dialogflow/v2beta1 is complete.
 */
// const {assert} = require('chai');
const {describe, after, before} = require('mocha');
// const {execSync} = require('child_process');
const uuid = require('uuid').v4;
const dialogflow = require('@google-cloud/dialogflow').v2beta1;

// const cmd = 'node detect.v2beta1.js createDocument';
// const testDocName = 'TestDoc';
// const testDocumentPath = 'https://cloud.google.com/storage/docs/faq';

// const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('create a document', () => {
  const client = new dialogflow.KnowledgeBasesClient();
  let knowledgeBaseName;

  before('create a knowledge base for the document', async () => {
    const projectId = await client.getProjectId();
    const request = {
      parent: 'projects/' + projectId,
      knowledgeBase: {
        displayName: `${uuid().split('-')[0]}-TestKnowledgeBase`,
      },
    };

    const [result] = await client.createKnowledgeBase(request);
    knowledgeBaseName = result.name;
  });

  // it('should create a document', () => {
  //   const output = exec(
  //     `${cmd} -n "${knowledgeBaseName}" -z "${testDocumentPath}" -m "${testDocName}"`
  //   );
  //   assert.include(output, 'Document created');
  // });

  after('delete created document', async () => {
    await client.deleteKnowledgeBase({
      name: knowledgeBaseName,
      force: true,
    });
  });
});
