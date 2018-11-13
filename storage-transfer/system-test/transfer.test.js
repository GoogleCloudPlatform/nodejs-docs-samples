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

const storage = require(`@google-cloud/storage`)();
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const program = require(`../transfer`);

const firstBucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const secondBucketName = `nodejs-docs-samples-test-${uuid.v4()}`;

let jobName;
const date = `2222/08/11`;
const time = `15:30`;
const description = `this is a test`;
const status = `DISABLED`;

test.before(tools.checkCredentials);
test.before(async () => {
  tools.stubConsole();

  const bucketOptions = {
    entity: 'allUsers',
    role: storage.acl.WRITER_ROLE,
  };
  await storage.createBucket(firstBucketName).then(data => {
    const bucket = data[0];
    return bucket.acl.add(bucketOptions);
  });
  await storage.createBucket(secondBucketName).then(data => {
    const bucket = data[0];
    return bucket.acl.add(bucketOptions);
  });
});

test.after.always(async () => {
  tools.restoreConsole();
  const bucketOne = storage.bucket(firstBucketName);
  const bucketTwo = storage.bucket(secondBucketName);
  try {
    bucketOne.deleteFiles({force: true});
  } catch (err) {} // ignore error
  try {
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

test.cb.serial(`should create a storage transfer job`, t => {
  const options = {
    srcBucket: firstBucketName,
    destBucket: secondBucketName,
    date: date,
    time: time,
    description: description,
  };

  program.createTransferJob(options, (err, transferJob) => {
    t.ifError(err);
    jobName = transferJob.name;
    t.is(transferJob.name.indexOf(`transferJobs/`), 0);
    t.is(transferJob.description, description);
    t.is(transferJob.status, `ENABLED`);
    t.true(
      console.log.calledWith(`Created transfer job: %s`, transferJob.name)
    );
    setTimeout(t.end, 2000);
  });
});

test.cb.serial(`should get a transferJob`, t => {
  program.getTransferJob(jobName, (err, transferJob) => {
    t.ifError(err);
    t.is(transferJob.name, jobName);
    t.is(transferJob.description, description);
    t.is(transferJob.status, `ENABLED`);
    t.true(console.log.calledWith(`Found transfer job: %s`, transferJob.name));
    setTimeout(t.end, 2000);
  });
});

test.cb.serial(`should update a transferJob`, t => {
  var options = {
    job: jobName,
    field: `status`,
    value: status,
  };

  program.updateTransferJob(options, (err, transferJob) => {
    t.ifError(err);
    t.is(transferJob.name, jobName);
    t.is(transferJob.description, description);
    t.is(transferJob.status, status);
    t.true(
      console.log.calledWith(`Updated transfer job: %s`, transferJob.name)
    );
    setTimeout(t.end, 2000);
  });
});

test.cb.serial(`should list transferJobs`, t => {
  program.listTransferJobs((err, transferJobs) => {
    t.ifError(err);
    t.true(transferJobs.some(transferJob => transferJob.name === jobName));
    t.true(
      transferJobs.some(transferJob => transferJob.description === description)
    );
    t.true(transferJobs.some(transferJob => transferJob.status === status));
    t.true(console.log.calledWith(`Found %d jobs!`, transferJobs.length));
    setTimeout(t.end, 2000);
  });
});

test.cb.serial(`should list transferJobs`, t => {
  program.listTransferOperations(jobName, (err, operations) => {
    t.ifError(err);
    t.true(Array.isArray(operations));
    t.end();
  });
});
