// Copyright 2026 Google LLC
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

const assert = require('node:assert/strict');
const {describe, it} = require('mocha');
const {answerQuery} = require('../answerQuery');
const {getDocument} = require('../getDocument');
const {batchGetDocuments} = require('../batchGetDocuments');
const {searchDocumentChunks} = require('../searchDocumentChunks');

describe('Developer Knowledge samples', () => {
  it('should answer query', async () => {
    const response = await answerQuery('How to create a Cloud Storage bucket');
    assert.ok(response);
    assert.ok(response.answer);
    assert.ok(response.answer.answerText.length > 0);
  });

  it('should get a single document', async () => {
    const docName =
      'documents/docs.cloud.google.com/storage/docs/creating-buckets';
    const document = await getDocument(docName);
    assert.ok(document);
    assert.strictEqual(document.name, docName);
    assert.ok(document.title.length > 0);
    assert.ok(document.content.length > 0);
  });

  it('should batch get multiple documents', async () => {
    const names = [
      'documents/docs.cloud.google.com/storage/docs/creating-buckets',
      'documents/docs.cloud.google.com/storage/docs/deleting-buckets',
    ];
    const response = await batchGetDocuments(names);
    assert.ok(response);
    assert.ok(response.documents);
    assert.strictEqual(response.documents.length, 2);
    for (const doc of response.documents) {
      assert.ok(names.includes(doc.name));
      assert.ok(doc.title.length > 0);
    }
  });

  it('should search document chunks', async () => {
    const chunks = await searchDocumentChunks(
      'Cloud Storage bucket creation',
      3
    );
    assert.ok(chunks);
    assert.ok(Array.isArray(chunks) && chunks.length > 0);
    assert.ok(chunks[0].parent.startsWith('documents/'));
    assert.ok(chunks[0].content.length > 0);
  });
});
