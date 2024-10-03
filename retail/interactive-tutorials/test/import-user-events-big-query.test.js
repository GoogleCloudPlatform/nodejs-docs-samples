// Copyright 2022 Google Inc.
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

const path = require('path');
const cp = require('child_process');
const {before, after, describe, it} = require('mocha');
const {assert, expect} = require('chai');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');
const utils = require('../setup/setup-cleanup');

describe('Import user events from big query table', () => {
  let stdout;
  const dataset = `user_events_${Math.round(Date.now() / 1000)}`;
  const table = 'events';
  const schema = 'interactive-tutorials/resources/events_schema.json';
  const sourceFile = 'interactive-tutorials/resources/user_events.json';

  before(async () => {
    await utils.createBqDataset(dataset);
    await utils.createBqTable(dataset, table, schema);
    await utils.uploadDataToBqTable(dataset, table, sourceFile, schema);
    stdout = execSync(
      `node interactive-tutorials/events/import-user-events-big-query.js ${dataset}`,
      {
        cwd,
      }
    );
  });

  it('should check that import started', () => {
    assert.match(stdout, /Start events import/);
  });

  it('should check that events imported correctly', async () => {
    const regex = new RegExp('Operation result: .*\\n', 'g');
    assert.match(stdout, regex);
    const string = stdout
      .match(regex)
      .toString()
      .replace('Operation result: ', '');
    const importOperation = JSON.parse(string);

    expect(importOperation).to.be.an('array');
    expect(importOperation.length).to.equal(3);

    const response = importOperation[1];
    const metadata = importOperation[2];

    expect(metadata).to.be.an('object');
    expect(metadata.done).to.be.true;

    expect(response).to.be.an('object');
  });

  it('should check that import finished', () => {
    assert.match(stdout, /Events import finished/);
  });

  after(async () => {
    await utils.deleteBqDataset(dataset);
  });
});
