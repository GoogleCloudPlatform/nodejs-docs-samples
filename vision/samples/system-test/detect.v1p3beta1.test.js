/**
 * Copyright 2017, Google, LLC.
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

const path = require(`path`);
const {Storage} = require(`@google-cloud/storage`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const storage = new Storage();
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node detect.v1p3beta1.js`;
const cwd = path.join(__dirname, `..`);

const files = [`duck_and_truck.jpg`, `handwritten.jpg`, `bicycle.jpg`].map(
  name => {
    return {
      name,
      localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
    };
  }
);

test.before(tools.checkCredentials);
test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await Promise.all(files.map(file => bucket.upload(file.localPath)));
});

test.after.always(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({force: true});
  await bucket.deleteFiles({force: true}); // Try a second time...
  await bucket.delete();
});

test.before(tools.checkCredentials);

test(`should read handwriting in local handwritten.jpg sample`, async t => {
  const output = await tools.runAsync(
    `${cmd} detectHandwriting ${files[1]}`,
    cwd
  );
  t.true(output.includes(`hand written message`));
});

test(`should read handwriting from handwritten.jpg in GCS bucket`, async t => {
  const output = await tools.runAsync(
    `${cmd} detectHandwritingGCS gs://${bucketName}/${files[1].name}`,
    cwd
  );
  t.true(output.includes(`hand written message`));
});
