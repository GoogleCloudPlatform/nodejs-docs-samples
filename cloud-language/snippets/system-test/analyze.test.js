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

const uuid = require(`uuid`);
const path = require(`path`);
const storage = require(`@google-cloud/storage`)();
const run = require(`../../utils`).run;

const cmd = `node analyze.js`;
const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const fileName = `text.txt`;
const localFilePath = path.join(__dirname, `../resources/text.txt`);
const text = `President Obama is speaking at the White House.`;

describe(`language:analyze`, () => {
  before(() => {
    return storage.createBucket(bucketName)
      .then((results) => results[0].upload(localFilePath));
  });

  after(() => {
    return storage.bucket(bucketName).deleteFiles({ force: true })
      .then(() => storage.bucket(bucketName).delete());
  });

  it(`should analyze sentiment in text`, () => {
    assert.equal(run(`${cmd} sentiment-text "${text}"`, cwd), `Sentiment: positive.`);
  });

  it(`should analyze sentiment in a file`, () => {
    assert.equal(run(`${cmd} sentiment-file ${bucketName} ${fileName}`, cwd), `Sentiment: positive.`);
  });

  it(`should analyze entities in text`, () => {
    const output = run(`${cmd} entities-text "${text}"`, cwd);
    assert.equal(output.includes(`Entities:`), true);
    assert.equal(output.includes(`people:`), true);
    assert.equal(output.includes(`places:`), true);
  });

  it('should analyze entities in a file', () => {
    const output = run(`${cmd} entities-file ${bucketName} ${fileName}`, cwd);
    assert.equal(output.includes(`Entities:`), true);
    assert.equal(output.includes(`people:`), true);
    assert.equal(output.includes(`places:`), true);
  });

  it(`should analyze syntax in text`, () => {
    const output = run(`${cmd} syntax-text "${text}"`, cwd);
    assert.equal(output.includes(`Tags:`), true);
    assert.equal(output.includes(`NOUN`), true);
    assert.equal(output.includes(`VERB`), true);
    assert.equal(output.includes(`PUNCT`), true);
  });

  it('should analyze syntax in a file', () => {
    const output = run(`${cmd} syntax-file ${bucketName} ${fileName}`, cwd);
    assert.equal(output.includes(`Tags:`), true);
    assert.equal(output.includes(`NOUN`), true);
    assert.equal(output.includes(`VERB`), true);
    assert.equal(output.includes(`PUNCT`), true);
  });
});
