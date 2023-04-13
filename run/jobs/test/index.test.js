// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {execSync} = require('child_process');
const assert = require('assert');
const exec = cmd => execSync(cmd, {encoding: 'utf-8'});

describe('Unit Tests', () => {
  process.env.SLEEP_MS = 0;
  process.env.CLOUD_RUN_TASK_INDEX = 1;
  process.env.CLOUD_RUN_TASK_ATTEMPT = 1;

  it('should run successfully', async () => {
    const stdout = exec('node index');
    assert.match(stdout, /Starting Task #/);
    assert.match(stdout, /Completed Task #/);
  });

  it('should fail with high fail rate', async () => {
    process.env.FAIL_RATE = 0.9999;
    assert.throws(
      () => {
        exec('node index');
      },
      {message: /failed./}
    );
  });
});
