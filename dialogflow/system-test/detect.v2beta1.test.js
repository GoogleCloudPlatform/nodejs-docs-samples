/**
 * Copyright 2018, Google, LLC.
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

const path = require('path');
const assert = require('assert');
const {runAsync} = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid/v4');

const cmd = 'node detect.v2beta1.js';
const cwd = path.join(__dirname, '..');
const testQuery = 'Where is my data stored?';
const testKnowledgeBaseName = `${uuid().split('-')[0]}-TestKnowledgeBase`;
const testDocName = 'TestDoc';
const testDocumentPath = 'https://cloud.google.com/storage/docs/faq';

it('It should create a knowledge base', async () => {
  // Check that the knowledge base does not yet exist
  let output = await runAsync(`${cmd} listKnowledgeBases`, cwd);
  assert.strictEqual(output.includes(testKnowledgeBaseName), false);

  // Creates a knowledge base
  output = await runAsync(
    `${cmd} createKnowledgeBase -k ${testKnowledgeBaseName}`,
    cwd
  );
  assert.strictEqual(
    output.includes(`displayName: ${testKnowledgeBaseName}`),
    true
  );
  const knowbaseFullName = output
    .split('\n')[0]
    .split(':')[1]
    .trim();
  const knowbaseId = output
    .split('\n')[0]
    .split('knowledgeBases/')[1]
    .trim();

  // List the knowledge base
  output = await runAsync(`${cmd} listKnowledgeBases`, cwd);
  assert.strictEqual(output.includes(testKnowledgeBaseName), true);

  // Get the knowledge base
  output = await runAsync(`${cmd} getKnowledgeBase -b "${knowbaseId}"`, cwd);
  assert.strictEqual(
    output.includes(`displayName: ${testKnowledgeBaseName}`),
    true
  );
  assert.strictEqual(output.includes(`name: ${knowbaseFullName}`), true);

  // Create a document
  output = await runAsync(
    `${cmd} createDocument -n "${knowbaseFullName}" -z "${testDocumentPath}" -m "${testDocName}"`,
    cwd
  );
  assert.strictEqual(output.includes('Document created'), true);

  // List the Document
  output = await runAsync(`${cmd} listDocuments -n "${knowbaseFullName}"`);
  const parsedOut = output.split('\n');
  const documentFullPath = parsedOut[parsedOut.length - 1].split(':')[1];
  assert.strictEqual(
    output.includes(`There are 1 documents in ${knowbaseFullName}`),
    true
  );

  // Detect intent with Knowledge Base
  output = await runAsync(
    `${cmd} detectIntentKnowledge -q "${testQuery}" -n "${knowbaseId}"`,
    cwd
  );
  assert.strictEqual(output.includes('Detected Intent:'), true);

  // Delete the Document
  output = await runAsync(`${cmd} deleteDocument -d ${documentFullPath}`, cwd);
  assert.strictEqual(output.includes('document deleted'), true);

  // List the Document
  output = await runAsync(`${cmd} listDocuments -n "${knowbaseFullName}"`, cwd);
  assert.strictEqual(output.includes(documentFullPath), false);

  // Delete the Knowledge Base
  output = await runAsync(
    `${cmd} deleteKnowledgeBase -n "${knowbaseFullName}"`,
    cwd
  );

  // List the Knowledge Base
  output = await runAsync(`${cmd} listKnowledgeBases`, cwd);
  assert.strictEqual(output.includes(testKnowledgeBaseName), false);
});

it('It should detect Intent with Model Selection', async () => {
  const output = await runAsync(`${cmd} detectIntentwithModelSelection`, cwd);
  assert.strictEqual(
    output.includes(
      'Response: I can help with that. Where would you like to reserve a room?'
    ),
    true
  );
});

it('It should detect Intent with Text to Speech Response', async () => {
  const output = await runAsync(
    `${cmd} detectIntentwithTexttoSpeechResponse -q "${testQuery}"`,
    cwd
  );
  assert.strictEqual(
    output.includes('Audio content written to file: ./resources/output.wav'),
    true
  );
});

it('It should detect sentiment with intent', async () => {
  const output = await runAsync(
    `${cmd} detectIntentandSentiment -q "${testQuery}"`,
    cwd
  );
  assert.strictEqual(output.includes('Detected sentiment'), true);
});
