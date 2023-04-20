/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

import {assert} from 'chai';
import {it} from 'mocha';
import * as cp from 'child_process';

const execSync = (cmd: string) => cp.execSync(cmd, {encoding: 'utf-8'});

const PROJECT_ID: string = process.env.GOOGLE_CLOUD_PROJECT!;
const USERNAME = 'username';
const PASSWORD = 'password';
let stdout: string;

it('should obtain boolean result from password leak assessment call', async () => {
  stdout = execSync(
    `node --loader ts-node/esm passwordLeakAssessment.ts ${PROJECT_ID} ${USERNAME} ${PASSWORD}`
  );
  assert.match(stdout, /Hashes created/);
});
