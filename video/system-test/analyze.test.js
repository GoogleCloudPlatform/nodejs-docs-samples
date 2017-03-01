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

require(`../../system-test/_setup`);

const cmd = `node analyze.js`;

// analyze_faces
test(`should analyze faces`, async (t) => {
  const output = await runAsync(`${cmd} faces gs://nodejs-docs-samples/obama.mp4`);

  t.true(output.includes('Thumbnail size: 19856'));
  t.true(output.includes('Track 0 of face 0: frames 33281 to 1099937'));
});

// analyze_labels
test(`should analyze labels`, async (t) => {
  const output = await runAsync(`${cmd} labels gs://nodejs-docs-samples/obama.mp4`);

  t.true(output.includes('Label description: News conference'));
  t.true(output.includes('Frames 33281 to 22466722'));
});

// analyze_shots
test(`should analyze shots`, async (t) => {
  const output = await runAsync(`${cmd} shots gs://nodejs-docs-samples/obama.mp4`);

  t.true(output.includes('Scene 0:'));
  t.true(output.includes('Start: 33281'));
  t.true(output.includes('End: 22466722'));
});
