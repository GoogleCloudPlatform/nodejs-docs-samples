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

const storage = require(`@google-cloud/storage`)();
const uuid = require(`uuid`);
const path = require(`path`);
const run = require(`../../utils`).run;

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);
const userEmail = `00b4903a973860a50828a620e09dde96aae6122ca4f0835bd469384659f1a5b8`;
const fileName = `test.txt`;
const filePath = path.join(__dirname, `../resources`, fileName);
const cmd = `node acl.js`;

describe('storage:acl', () => {
  before(() => bucket.create().then((results) => results[0].upload(filePath)));

  after(() => {
    // Try deleting all files twice, just to make sure. Ignore any errors.
    return bucket.deleteFiles({ force: true })
      .then(() => bucket.deleteFiles({ force: true }), () => {})
      .then(() => bucket.delete(), () => {})
      .catch(() => {});
  });

  it(`should print acl for a bucket`, () => {
    const output = run(`${cmd} print-bucket-acl ${bucketName}`, cwd);
    assert.equal(output.includes(`OWNER: project-editors-`), true);
    assert.equal(output.includes(`OWNER: project-owners-`), true);
    assert.equal(output.includes(`READER: project-viewers-`), true);
  });

  it(`should print a user's acl for a bucket`, () => {
    return bucket.acl.readers.addUser(userEmail)
      .then(() => {
        const output = run(`${cmd} print-bucket-acl-for-user ${bucketName} ${userEmail}`, cwd);
        assert.equal(output, `READER: user-${userEmail}`);
        return bucket.acl.readers.deleteUser(userEmail);
      });
  });

  it(`should add a user as an owner on a bucket`, () => {
    const output = run(`${cmd} add-bucket-owner ${bucketName} ${userEmail}`, cwd);
    assert.equal(output, `Added user ${userEmail} as an owner on bucket ${bucketName}.`);
  });

  it(`should remove a user from a bucket`, () => {
    const output = run(`${cmd} remove-bucket-owner ${bucketName} ${userEmail}`, cwd);
    assert.equal(output, `Removed user ${userEmail} from bucket ${bucketName}.`);
  });

  it(`should add a user as a default owner on a bucket`, () => {
    const output = run(`${cmd} add-bucket-default-owner ${bucketName} ${userEmail}`, cwd);
    assert.equal(output, `Added user ${userEmail} as an owner on bucket ${bucketName}.`);
  });

  it(`should remove a default user from a bucket`, () => {
    const output = run(`${cmd} remove-bucket-default-owner ${bucketName} ${userEmail}`, cwd);
    assert.equal(output, `Removed user ${userEmail} from bucket ${bucketName}.`);
  });

  it(`should print acl for a file`, () => {
    const output = run(`${cmd} print-file-acl ${bucketName} ${fileName}`, cwd);
    assert.equal(output.includes(`OWNER: project-editors-`), true);
    assert.equal(output.includes(`OWNER: project-owners-`), true);
    assert.equal(output.includes(`READER: project-viewers-`), true);
  });

  it(`should print a user's acl for a file`, () => {
    return bucket.file(fileName).acl.readers.addUser(userEmail)
      .then(() => {
        const output = run(`${cmd} print-file-acl-for-user ${bucketName} ${fileName} ${userEmail}`, cwd);
        assert.equal(output, `READER: user-${userEmail}`);
        return bucket.file(fileName).acl.readers.deleteUser(userEmail);
      });
  });

  it(`should add a user as an owner on a bucket`, () => {
    const output = run(`${cmd} add-file-owner ${bucketName} ${fileName} ${userEmail}`, cwd);
    assert.equal(output, `Added user ${userEmail} as an owner on file ${fileName}.`);
  });

  it(`should remove a user from a bucket`, () => {
    const output = run(`${cmd} remove-file-owner ${bucketName} ${fileName} ${userEmail}`, cwd);
    assert.equal(output, `Removed user ${userEmail} from file ${fileName}.`);
  });
});
