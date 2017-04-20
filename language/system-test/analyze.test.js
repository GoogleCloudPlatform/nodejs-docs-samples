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
const germanText = `Willkommen bei München`;

test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await bucket.upload(localFilePath);
});

test.after.always(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({ force: true });
  await bucket.deleteFiles({ force: true }); // Try a second time...
  await bucket.delete();
});

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test(`should analyze sentiment in text`, async (t) => {
  const output = await runAsync(`${cmd} sentiment-text "${text}"`, cwd);
  t.true(output.includes(`Document sentiment:`));
  t.true(output.includes(`Sentence: ${text}`));
  t.true(output.includes(`Score: 0`));
  t.true(output.includes(`Magnitude: 0`));
});

test(`should analyze sentiment in a file`, async (t) => {
  const output = await runAsync(`${cmd} sentiment-file ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`Document sentiment:`));
  t.true(output.includes(`Sentence: ${text}`));
  t.true(output.includes(`Score: 0`));
  t.true(output.includes(`Magnitude: 0`));
});

test(`should analyze entities in text`, async (t) => {
  const output = await runAsync(`${cmd} entities-text "${text}"`, cwd);
  t.true(output.includes(`Obama`));
  t.true(output.includes(`Type: PERSON`));
  t.true(output.includes(`White House`));
  t.true(output.includes(`Type: LOCATION`));
  t.true(output.includes(`/wiki/Barack_Obama`));
});

test('should analyze entities in a file', async (t) => {
  const output = await runAsync(`${cmd} entities-file ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`Entities:`));
  t.true(output.includes(`Obama`));
  t.true(output.includes(`Type: PERSON`));
  t.true(output.includes(`White House`));
  t.true(output.includes(`Type: LOCATION`));
  t.true(output.includes(`/wiki/Barack_Obama`));
});

test(`should analyze syntax in text`, async (t) => {
  const output = await runAsync(`${cmd} syntax-text "${text}"`, cwd);
  t.true(output.includes(`Parts of speech:`));
  t.true(output.includes(`NOUN:`));
  t.true(output.includes(`President`));
  t.true(output.includes(`Obama`));
  t.true(output.includes(`Morphology:`));
  t.true(output.includes(`tag: 'NOUN'`));
});

test('should analyze syntax in a file', async (t) => {
  const output = await runAsync(`${cmd} syntax-file ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`NOUN:`));
  t.true(output.includes(`President`));
  t.true(output.includes(`Obama`));
  t.true(output.includes(`Morphology:`));
  t.true(output.includes(`tag: 'NOUN'`));
});

test('should analyze syntax in a 1.1 language (German)', async (t) => {
  const output = await runAsync(`${cmd} syntax-text "${germanText}"`, cwd);
  t.true(output.includes(`Parts of speech:`));
  t.true(output.includes(`ADV: Willkommen`));
  t.true(output.includes(`ADP: bei`));
  t.true(output.includes(`NOUN: München`));
});

test(`should analyze entity sentiment in text`, async (t) => {
  const output = await runAsync(`${cmd} entity-sentiment-text "${text}"`, cwd);
  t.true(output.includes(`Entities and sentiments:`));
  t.true(output.includes(`Obama`));
  t.true(output.includes(`PERSON`));
  t.true(output.includes(`Score: 0`));
  t.true(output.includes(`Magnitude: 0`));
});

test('should analyze entity sentiment in a file', async (t) => {
  const output = await runAsync(`${cmd} entity-sentiment-file ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`Entities and sentiments:`));
  t.true(output.includes(`Obama`));
  t.true(output.includes(`PERSON`));
  t.true(output.includes(`Score: 0`));
  t.true(output.includes(`Magnitude: 0`));
});
