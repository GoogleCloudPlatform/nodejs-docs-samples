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

const uuid = require(`uuid`);
const path = require(`path`);
const storage = require(`@google-cloud/storage`)();

const cmd = `node analyze.js`;
const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const fileName = `text.txt`;
const localFilePath = path.join(__dirname, `../resources/text.txt`);
const text = `President Obama is speaking at the White House.`;

test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await bucket.upload(localFilePath);
});

test.after(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({ force: true });
  await bucket.deleteFiles({ force: true }); // Try a second time...
  await bucket.delete();
});

test.beforeEach(stubConsole);
test.afterEach(restoreConsole);

test(`should run sync recognize`, async (t) => {
  const output = await runAsync(`${cmd} sentiment-text "${text}"`, cwd);
  t.true(output.includes(`Sentiment: positive.`));
});

test(`should analyze sentiment in a file`, async (t) => {
  const output = await runAsync(`${cmd} sentiment-file ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`Sentiment: positive.`));
});

test(`should analyze entities in text`, async (t) => {
  const output = await runAsync(`${cmd} entities-text "${text}"`, cwd);
  t.true(output.includes(`Entities:`));
  t.true(output.includes(`people:`));
  t.true(output.includes(`places:`));
});

test('should analyze entities in a file', async (t) => {
  const output = await runAsync(`${cmd} entities-file ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`Entities:`));
  t.true(output.includes(`people:`));
  t.true(output.includes(`places:`));
});

test(`should analyze syntax in text`, async (t) => {
  const output = await runAsync(`${cmd} syntax-text "${text}"`, cwd);
  t.true(output.includes(`Tags:`));
  t.true(output.includes(`NOUN`));
  t.true(output.includes(`VERB`));
  t.true(output.includes(`PUNCT`));
});

test('should analyze syntax in a file', async (t) => {
  const output = await runAsync(`${cmd} syntax-file ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`Tags:`));
  t.true(output.includes(`NOUN`));
  t.true(output.includes(`VERB`));
  t.true(output.includes(`PUNCT`));
});
