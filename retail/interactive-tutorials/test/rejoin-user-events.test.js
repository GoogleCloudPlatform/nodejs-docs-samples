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
const {before, describe, it} = require('mocha');
const {assert} = require('chai');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');

describe('Rejoin user events', () => {
  const eventType = 'detail-page-view';
  const visitorId = 'test_visitor_id';
  let stdout;

  before(async () => {
    stdout = execSync(
      'node interactive-tutorials/events/rejoin-user-events.js',
      {cwd}
    );
  });

  it('should check that new event already created', () => {
    const regex = new RegExp(
      `Created event ${eventType} with visitor id ${visitorId}`,
      'g'
    );
    assert.match(stdout, regex);
  });

  it('should check that rejoin operation started', () => {
    const regex = new RegExp('Rejoin operation in progress', 'g');
    assert.match(stdout, regex);
  });

  it('should check that purge operation started', () => {
    const regex = new RegExp('Purge operation in progress', 'g');
    assert.match(stdout, regex);
  });
});
