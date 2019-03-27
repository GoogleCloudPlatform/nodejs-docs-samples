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

/* eslint no-empty: 0 */
'use strict';

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');

const program = require('../transfer');

const firstBucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const secondBucketName = `nodejs-docs-samples-test-${uuid.v4()}`;

let jobName;
const date = '2222/08/11';
const time = '15:30';
const description = 'this is a test';
const status = 'DISABLED';

before(async () => {
  tools.checkCredentials();
  tools.stubConsole();

  const bucketOptions = {
    entity: 'allUsers',
    role: storage.acl.WRITER_ROLE,
  };
  const [bucket1] = await storage.createBucket(firstBucketName);
  await bucket1.acl.add(bucketOptions);
  const [bucket2] = await storage.createBucket(secondBucketName);
  await bucket2.acl.add(bucketOptions);
});

after(async () => {
  tools.restoreConsole();
  const bucketOne = storage.bucket(firstBucketName);
  const bucketTwo = storage.bucket(secondBucketName);
  try {
    bucketOne.deleteFiles({force: true});
  } catch (err) {} // ignore error
  try {
    // Intentially, try a second time.
    bucketOne.deleteFiles({force: true});
  } catch (err) {} // ignore error
  try {
    bucketOne.delete();
  } catch (err) {} // ignore error
  try {
    bucketTwo.deleteFiles({force: true});
  } catch (err) {} // ignore error
  try {
    bucketTwo.deleteFiles({force: true});
  } catch (err) {} // ignore error
  try {
    bucketTwo.delete();
  } catch (err) {} // ignore error
});

it('should create a storage transfer job', done => {
  const options = {
    srcBucket: firstBucketName,
    destBucket: secondBucketName,
    date: date,
    time: time,
    description: description,
  };

  program.createTransferJob(options, (err, transferJob) => {
    assert.ifError(err);
    jobName = transferJob.name;
    assert.strictEqual(transferJob.name.indexOf('transferJobs/'), 0);
    assert.strictEqual(transferJob.description, description);
    assert.strictEqual(transferJob.status, 'ENABLED');
    assert.strictEqual(
      console.log.calledWith('Created transfer job: %s', transferJob.name),
      true
    );
    done();
  });
});

it('should get a transferJob', done => {
  program.getTransferJob(jobName, (err, transferJob) => {
    assert.ifError(err);
    assert.strictEqual(transferJob.name, jobName);
    assert.strictEqual(transferJob.description, description);
    assert.strictEqual(transferJob.status, 'ENABLED');
    assert.strictEqual(
      console.log.calledWith('Found transfer job: %s', transferJob.name),
      true
    );
    done();
  });
});

it('should update a transferJob', done => {
  const options = {
    job: jobName,
    field: 'status',
    value: status,
  };

  program.updateTransferJob(options, (err, transferJob) => {
    assert.ifError(err);
    assert.strictEqual(transferJob.name, jobName);
    assert.strictEqual(transferJob.description, description);
    assert.strictEqual(transferJob.status, status);
    assert.strictEqual(
      console.log.calledWith('Updated transfer job: %s', transferJob.name),
      true
    );
    done();
  });
});

it('should list transferJobs', done => {
  program.listTransferJobs((err, transferJobs) => {
    assert.ifError(err);
    assert.strictEqual(
      transferJobs.some(transferJob => transferJob.name === jobName),
      true
    );
    assert.strictEqual(
      transferJobs.some(transferJob => transferJob.description === description),
      true
    );
    assert.strictEqual(
      transferJobs.some(transferJob => transferJob.status === status),
      true
    );
    assert.strictEqual(
      console.log.calledWith('Found %d jobs!', transferJobs.length),
      true
    );
    done();
  });
});

it('should list transferOperations', done => {
  program.listTransferOperations(jobName, (err, operations) => {
    assert.ifError(err);
    assert.strictEqual(Array.isArray(operations), true);
    done();
  });
});
