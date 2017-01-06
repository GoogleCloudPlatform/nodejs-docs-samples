/**
 * Copyright 2016, Google, Inc.
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

require(`../../system-test/_setup`);

const path = require(`path`);

const cwd = path.join(__dirname, `..`);
const cmd = `node projects.js`;

test(`should list projects`, async (t) => {
  const stdout = await runAsync(`${cmd} list`, cwd);
  t.true(stdout.includes(`Projects:`));
  t.true(stdout.includes(`${process.env.GCLOUD_PROJECT}`));
});
