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
const {assert} = require('chai');
const sinon = require('sinon');

const text = 'Document Schema Deleted';

const {deleteDocumentSchema} = require('../delete-document-schema');

// TODO(developer): Fill in the variables below before running this test.
const projectId = 'YOUR_PROJECT_ID';
const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
const documentSchemaId = 'YOUR_DOCUMENT_SCHEMA_ID';

describe('Delete document schema', () => {
  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  beforeEach(stubConsole);

  it('should delete a document schema', async () => {
    await deleteDocumentSchema(projectId, location, documentSchemaId);
    assert.include(console.log.firstCall.args[0], text);
  });
});
