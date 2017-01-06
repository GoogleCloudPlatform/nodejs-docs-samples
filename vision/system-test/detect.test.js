/**
 * Copyright 2017, Google, Inc.
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
const storage = require(`@google-cloud/storage`)();
const uuid = require(`uuid`);

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node detect.js`;
const cwd = path.join(__dirname, `..`);
const files = [
  `face_no_surprise.jpg`,
  `landmark.jpg`,
  `logos.png`,
  `text.jpg`,
  `wakeupcat.jpg`
].map((name) => {
  return {
    name,
    localPath: path.resolve(path.join(__dirname, `../resources/${name}`))
  };
});

test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await Promise.all(files.map((file) => bucket.upload(file.localPath)));
});

test.after.always(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({ force: true });
  await bucket.deleteFiles({ force: true }); // Try a second time...
  await bucket.delete();
});

test(`should detect faces in a local file`, async (t) => {
  const output = await runAsync(`${cmd} faces ${files[0].localPath}`, cwd);
  t.true(output.includes(`Faces:`));
  t.true(output.includes(`Face #1:`));
});

test(`should detect faces in a remote file`, async (t) => {
  const output = await runAsync(`${cmd} faces-gcs ${bucketName} ${files[0].name}`, cwd);
  t.true(output.includes(`Faces:`));
  t.true(output.includes(`Face #1:`));
});

test(`should detect labels in a local file`, async (t) => {
  const output = await runAsync(`${cmd} labels ${files[4].localPath}`, cwd);
  t.true(output.includes(`Labels:`));
  t.true(output.includes(`cat`));
});

test(`should detect labels in a remote file`, async (t) => {
  const output = await runAsync(`${cmd} labels-gcs ${bucketName} ${files[4].name}`, cwd);
  t.true(output.includes(`Labels:`));
  t.true(output.includes(`cat`));
});

test(`should detect landmarks in a local file`, async (t) => {
  const output = await runAsync(`${cmd} landmarks ${files[1].localPath}`, cwd);
  t.true(output.includes(`Landmarks:`));
  t.true(output.includes(`Palace of Fine Arts`));
});

test(`should detect landmarks in a remote file`, async (t) => {
  const output = await runAsync(`${cmd} landmarks-gcs ${bucketName} ${files[1].name}`, cwd);
  t.true(output.includes(`Landmarks:`));
  t.true(output.includes(`Palace of Fine Arts`));
});

test(`should detect text in a local file`, async (t) => {
  const output = await runAsync(`${cmd} text ${files[3].localPath}`, cwd);
  t.true(output.includes(`Text:`));
  t.true(output.includes(`System Software Update`));
});

test(`should detect text in a remote file`, async (t) => {
  const output = await runAsync(`${cmd} text-gcs ${bucketName} ${files[3].name}`, cwd);
  t.true(output.includes(`Text:`));
  t.true(output.includes(`System Software Update`));
});

test(`should detect logos in a local file`, async (t) => {
  const output = await runAsync(`${cmd} logos ${files[2].localPath}`, cwd);
  t.true(output.includes(`Logos:`));
  t.true(output.includes(`Google`));
});

test(`should detect logos in a remote file`, async (t) => {
  const output = await runAsync(`${cmd} logos-gcs ${bucketName} ${files[2].name}`, cwd);
  t.true(output.includes(`Logos:`));
  t.true(output.includes(`Google`));
});

test(`should detect properties in a local file`, async (t) => {
  const output = await runAsync(`${cmd} properties ${files[1].localPath}`, cwd);
  t.true(output.includes(`Colors:`));
  t.true(output.split(`\n`).length > 4, `Multiple colors were detected.`);
});

test(`should detect properties in a remote file`, async (t) => {
  const output = await runAsync(`${cmd} properties-gcs ${bucketName} ${files[1].name}`, cwd);
  t.true(output.includes(`Colors:`));
  t.true(output.split(`\n`).length > 4, `Multiple colors were detected.`);
});

test(`should detect safe-search in a local file`, async (t) => {
  const output = await runAsync(`${cmd} safe-search ${files[4].localPath}`, cwd);
  t.true(output.includes(`Medical:`));
});

test(`should detect safe-search in a remote file`, async (t) => {
  const output = await runAsync(`${cmd} safe-search-gcs ${bucketName} ${files[4].name}`, cwd);
  t.true(output.includes(`Medical:`));
});
