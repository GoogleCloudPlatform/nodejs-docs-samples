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

import { assert } from 'chai';
import { describe, it, before } from 'mocha';
import { execSync as _execSync } from 'child_process';
import { DlpServiceClient } from '@google-cloud/dlp';

const execSync = cmd => _execSync(cmd, {encoding: 'utf-8'});

const client = new DlpServiceClient();
describe('quickstart', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });
  it('should run', () => {
    const output = execSync(`node quickstart.js ${projectId}`);
    assert.match(output, /Info type: PERSON_NAME/);
  });
});
