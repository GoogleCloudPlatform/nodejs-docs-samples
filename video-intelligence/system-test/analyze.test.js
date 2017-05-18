/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://cloud.google.com/video-intelligence/docs/

'use strict';

const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node analyze.js`;
const cwd = path.join(__dirname, `..`);

// analyze_faces
test(`should analyze faces in a GCS file`, async (t) => {
  const output = await tools.runAsync(`${cmd} faces gs://nodejs-docs-samples/video/google_gmail.mp4`, cwd);
  t.regex(output, /Thumbnail size: \d+/);
});

// analyze_labels_gcs
test(`should analyze labels in a GCS file`, async (t) => {
  const output = await tools.runAsync(`${cmd} labels-gcs gs://nodejs-docs-samples/video/cat.mp4`, cwd);
  t.regex(output, /Label description: Whiskers/);
});

// analyze_labels_local
test(`should analyze labels in a local file`, async (t) => {
  const output = await tools.runAsync(`${cmd} labels-file resources/cat.mp4`, cwd);
  t.regex(output, /Label description: Whiskers/);
});

// analyze_shots
test(`should analyze shots in a GCS file`, async (t) => {
  const output = await tools.runAsync(`${cmd} shots gs://nodejs-docs-samples/video/google_gmail.mp4`, cwd);
  t.regex(output, /Scene 0:/);
});

// analyze_safe_search
test(`should analyze safe search results in a GCS file`, async (t) => {
  const output = await tools.runAsync(`${cmd} safe-search gs://nodejs-docs-samples/video/google_gmail.mp4`, cwd);
  t.regex(output, /Time: \d\.\d+s/);
  t.regex(output, /Spoof:/);
});
