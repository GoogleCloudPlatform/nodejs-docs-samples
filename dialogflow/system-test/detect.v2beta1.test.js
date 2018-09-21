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

const test = require(`ava`);
const {runAsync} = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node detect.v2beta1.js';
const testQuery = `Where is my data stored?`;

const testKnowledgeBaseName = 'TestKnowledgeBase';

const testDocName = `TestDoc`;
const testDocumentPath = `https://cloud.google.com/storage/docs/faq`;

test.serial(`It should create a knowledge base`, async t => {
  // Check that the knowledge base does not yet exist
  let output = await runAsync(`${cmd} listKnowledgeBases`);
  t.false(output.includes(testKnowledgeBaseName));

  // Creates a knowledge base
  output = await runAsync(
    `${cmd} createKnowledgeBase -k ${testKnowledgeBaseName}`
  );
  t.true(output.includes(`displayName: ${testKnowledgeBaseName}`));
  const knowbaseFullName = output
    .split(`\n`)[0]
    .split(`:`)[1]
    .trim();
  const knowbaseId = output
    .split(`\n`)[0]
    .split(`knowledgeBases/`)[1]
    .trim();

  // List the knowledge base
  output = await runAsync(`${cmd} listKnowledgeBases`);
  t.true(output.includes(testKnowledgeBaseName));

  // Get the knowledge base
  output = await runAsync(`${cmd} getKnowledgeBase -b "${knowbaseId}"`);
  t.true(output.includes(`displayName: ${testKnowledgeBaseName}`));
  t.true(output.includes(`name: ${knowbaseFullName}`));

  // Create a document
  output = await runAsync(
    `${cmd} createDocument -n "${knowbaseFullName}" -z "${testDocumentPath}" -m "${testDocName}"`
  );
  t.true(output.includes(`Document created`));

  // List the Document
  output = await runAsync(`${cmd} listDocuments -n "${knowbaseFullName}"`);
  const parsedOut = output.split(`\n`);
  const documentFullPath = parsedOut[parsedOut.length - 1].split(`:`)[1];
  t.true(output.includes(`There are 1 documents in ${knowbaseFullName}`));

  // Detect intent with Knowledge Base
  output = await runAsync(
    `${cmd} detectIntentKnowledge -q "${testQuery}" -n "${knowbaseId}"`
  );
  t.true(output.includes(`Detected Intent:`));

  // Delete the Document
  output = await runAsync(`${cmd} deleteDocument -d ${documentFullPath}`);
  t.true(output.includes(`document deleted`));

  // List the Document
  output = await runAsync(`${cmd} listDocuments -n "${knowbaseFullName}"`);
  t.false(output.includes(documentFullPath));

  // Delete the Knowledge Base
  output = await runAsync(
    `${cmd} deleteKnowledgeBase -n "${knowbaseFullName}"`
  );

  // List the Knowledge Base
  output = await runAsync(`${cmd} listKnowledgeBases`);
  t.false(output.includes(testKnowledgeBaseName));
});

test(`It should detect Intent with Model Selection`, async t => {
  const output = await runAsync(`${cmd} detectIntentwithModelSelection`);
  t.true(
    output.includes(
      `Response: I can help with that. Where would you like to reserve a room?`
    )
  );
});

test(`It should detect Intent with Text to Speech Response`, async t => {
  const output = await runAsync(
    `${cmd} detectIntentwithTexttoSpeechResponse -q "${testQuery}"`
  );
  t.true(
    output.includes(`Audio content written to file: ./resources/output.wav`)
  );
});

test(`It should detect sentiment with intent`, async t => {
  const output = await runAsync(
    `${cmd} detectIntentandSentiment -q "${testQuery}"`
  );
  t.true(output.includes(`Detected sentiment`));
});
