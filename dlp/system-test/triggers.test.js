// Copyright 2018 Google LLC
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
const {describe, it, before} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');
const DLP = require('@google-cloud/dlp');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const client = new DLP.DlpServiceClient();

describe('triggers', () => {
  let projectId;
  let fullTriggerName;
  const triggerName = `my-trigger-${uuid.v4()}`;
  const triggerDisplayName = `My Trigger Display Name: ${uuid.v4()}`;
  const triggerDescription = `My Trigger Description: ${uuid.v4()}`;
  const infoType = 'PERSON_NAME';
  const minLikelihood = 'VERY_LIKELY';
  const maxFindings = 5;
  const bucketName = process.env.BUCKET_NAME;

  before(async () => {
    projectId = await client.getProjectId();
    fullTriggerName = `projects/${projectId}/locations/global/jobTriggers/${triggerName}`;
  });

  it('should create a trigger', () => {
    const output = execSync(
      `node createTrigger.js ${projectId} ${triggerName} "${triggerDisplayName}" "${triggerDescription}" ${bucketName} true '1' ${infoType} ${minLikelihood} ${maxFindings}`
    );
    assert.include(output, `Successfully created trigger ${fullTriggerName}`);
  });

  it('should list triggers', () => {
    const output = execSync(`node listTriggers.js ${projectId}`);
    assert.include(output, `Trigger ${fullTriggerName}`);
    assert.include(output, `Display Name: ${triggerDisplayName}`);
    assert.include(output, `Description: ${triggerDescription}`);
    assert.match(output, /Created: \d{1,2}\/\d{1,2}\/\d{4}/);
    assert.match(output, /Updated: \d{1,2}\/\d{1,2}\/\d{4}/);
    assert.match(output, /Status: HEALTHY/);
    assert.match(output, /Error count: 0/);
  });

  it('should delete a trigger', () => {
    const output = execSync(
      `node deleteTrigger.js ${projectId} ${fullTriggerName}`
    );
    assert.include(output, `Successfully deleted trigger ${fullTriggerName}.`);
  });

  it('should handle trigger creation errors', () => {
    let output;
    try {
      output = execSync(
        `node createTrigger.js ${projectId} 'name' "${triggerDisplayName}" ${bucketName} true 1 "@@@@@" ${minLikelihood} ${maxFindings}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'fail');
  });

  it('should handle trigger deletion errors', () => {
    let output;
    try {
      output = execSync(
        `node deleteTrigger.js ${projectId} 'bad-trigger-path'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'fail');
  });
});
