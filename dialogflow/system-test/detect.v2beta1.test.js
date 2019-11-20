/**
 * Copyright 2018 Google LLC
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

const {assert} = require('chai');
const {execSync} = require('child_process');
const uuid = require('uuid/v4');

const cmd = 'node detect.v2beta1.js';
const testQuery = 'Where is my data stored?';
const testKnowledgeBaseName = `${uuid().split('-')[0]}-TestKnowledgeBase`;
const testDocName = 'TestDoc';
const testDocumentPath = 'https://cloud.google.com/storage/docs/faq';

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('v2beta1 detection', () => {
  let knowbaseFullName;
  let knowbaseId;
  let documentFullPath;

  it('should create a knowledge base', () => {
    // Check that the knowledge base does not yet exist
    let output = exec(`${cmd} listKnowledgeBases`);
    assert.notInclude(output, testKnowledgeBaseName);

    // Creates a knowledge base
    output = exec(`${cmd} createKnowledgeBase -k ${testKnowledgeBaseName}`);
    assert.include(output, `displayName: ${testKnowledgeBaseName}`);

    knowbaseFullName = output
      .split('\n')[0]
      .split(':')[1]
      .trim();
    knowbaseId = output
      .split('\n')[0]
      .split('knowledgeBases/')[1]
      .trim();
  });

  it('should list the knowledge bases', () => {
    const output = exec(`${cmd} listKnowledgeBases`);
    assert.include(output, testKnowledgeBaseName);
  });

  it('should get a knowledge base', () => {
    const output = exec(`${cmd} getKnowledgeBase -b "${knowbaseId}"`);
    assert.include(output, `displayName: ${testKnowledgeBaseName}`);
    assert.include(output, `name: ${knowbaseFullName}`);
  });

  it('should create a document', () => {
    const output = exec(
      `${cmd} createDocument -n "${knowbaseFullName}" -z "${testDocumentPath}" -m "${testDocName}"`
    );
    assert.include(output, 'Document created');
  });

  it('should list documents', () => {
    const output = exec(`${cmd} listDocuments -n "${knowbaseFullName}"`);
    const parsedOut = output.split('\n').filter(x => !!x.trim());
    documentFullPath = parsedOut[parsedOut.length - 1].split(':')[1];
    assert.isDefined(documentFullPath);
    assert.include(output, `There are 1 documents in ${knowbaseFullName}`);
  });

  it('should detect intent with a knowledge base', () => {
    const output = exec(
      `${cmd} detectIntentKnowledge -q "${testQuery}" -n "${knowbaseId}"`
    );
    assert.include(output, 'Detected Intent:');
  });

  it('should delete a document', () => {
    const output = exec(`${cmd} deleteDocument -d ${documentFullPath}`);
    assert.include(output, 'document deleted');
  });

  it('should list the document', () => {
    const output = exec(`${cmd} listDocuments -n "${knowbaseFullName}"`);
    assert.notInclude(output, documentFullPath);
  });

  it('should delete the Knowledge Base', () => {
    exec(`${cmd} deleteKnowledgeBase -n "${knowbaseFullName}"`);
  });

  it('should list the Knowledge Base', () => {
    const output = exec(`${cmd} listKnowledgeBases`);
    assert.notInclude(output, testKnowledgeBaseName);
  });

  it('should detect Intent with Model Selection', () => {
    const output = exec(`${cmd} detectIntentwithModelSelection`);
    assert.include(
      output,
      'Response: I can help with that. Where would you like to reserve a room?'
    );
  });

  it('should detect Intent with Text to Speech Response', () => {
    const output = exec(
      `${cmd} detectIntentwithTexttoSpeechResponse -q "${testQuery}"`
    );
    assert.include(
      output,
      'Audio content written to file: ./resources/output.wav'
    );
  });

  it('should detect sentiment with intent', () => {
    const output = exec(`${cmd} detectIntentandSentiment -q "${testQuery}"`);
    assert.include(output, 'Detected sentiment');
  });
});
