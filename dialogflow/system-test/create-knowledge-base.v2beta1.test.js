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

const {assert} = require('chai');
const {describe, after, it} = require('mocha');
const {execSync} = require('child_process');
const uuid = require('uuid').v4;
const dialogflow = require('@google-cloud/dialogflow').v2beta1;

const cmd = 'node detect.v2beta1.js createKnowledgeBase';
const testKnowledgeBaseName = `${uuid().split('-')[0]}-TestKnowledgeBase`;

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('create a knowledge base', () => {
  const client = new dialogflow.KnowledgeBasesClient();
  let knowledgeBaseName;

  it('should create a knowledge base', () => {
    const output = exec(`${cmd} -k ${testKnowledgeBaseName}`);
    assert.include(output, `displayName: ${testKnowledgeBaseName}`);

    knowledgeBaseName = output.split('\n')[0].split(':')[1].trim();
  });

  after('delete created knowledge base', async () => {
    await client.deleteKnowledgeBase({
      name: knowledgeBaseName,
    });
  });
});
