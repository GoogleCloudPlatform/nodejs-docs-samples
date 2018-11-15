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

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const srcBucketName = `foo`;
const destBucketName = `bar`;
const jobName = `transferJobs/123456789012345678`;
const transferOperationName = `transferOperations/123456789012345678`;

function getSample() {
  const transferJobMock = {
    name: jobName,
  };
  const transferOperationMock = {};
  const storagetransferMock = {
    transferJobs: {
      create: sinon.stub().yields(null, {data: transferJobMock}),
      get: sinon.stub().yields(null, {data: transferJobMock}),
      patch: sinon.stub().yields(null, {data: transferJobMock}),
      list: sinon.stub().yields(null, {
        data: {
          transferJobs: [transferJobMock],
        },
      }),
    },
    transferOperations: {
      get: sinon.stub().yields(null, {data: transferOperationMock}),
      pause: sinon.stub().yields(null, {data: transferOperationMock}),
      resume: sinon.stub().yields(null, {data: transferOperationMock}),
      list: sinon.stub().yields(null, {
        data: {
          operations: [transferOperationMock],
        },
      }),
    },
  };
  const googleMock = {
    storagetransfer: sinon.stub().returns(storagetransferMock),
    auth: {
      getApplicationDefault: sinon.stub().yields(null, {}),
    },
  };

  const googleapisMock = {
    google: googleMock,
  };

  return {
    program: proxyquire(`../transfer`, {
      googleapis: googleapisMock,
      yargs: proxyquire(`yargs`, {}),
    }),
    mocks: {
      googleapis: googleapisMock,
      storagetransfer: storagetransferMock,
      transferJob: transferJobMock,
      transferOperation: transferOperationMock,
    },
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`should create a transfer job`, t => {
  const description = `description`;
  const sample = getSample();
  const callback = sinon.stub();
  const date = `2016/08/11`;
  const time = `15:30`;
  const options = {
    srcBucket: srcBucketName,
    destBucket: destBucketName,
    date: date,
    time: time,
  };

  sample.program.createTransferJob(options, callback);

  t.true(sample.mocks.storagetransfer.transferJobs.create.calledOnce);
  t.is(
    sample.mocks.storagetransfer.transferJobs.create.firstCall.args[0].resource
      .description,
    undefined
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [null, sample.mocks.transferJob]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [
    `Created transfer job: %s`,
    sample.mocks.transferJob.name,
  ]);

  options.description = description;
  sample.program.createTransferJob(options, callback);

  t.true(sample.mocks.storagetransfer.transferJobs.create.calledTwice);
  t.is(
    sample.mocks.storagetransfer.transferJobs.create.secondCall.args[0].resource
      .description,
    description
  );
  t.true(callback.calledTwice);
  t.deepEqual(callback.secondCall.args, [null, sample.mocks.transferJob]);
  t.true(console.log.calledTwice);
  t.deepEqual(console.log.secondCall.args, [
    `Created transfer job: %s`,
    sample.mocks.transferJob.name,
  ]);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.createTransferJob({}, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle create error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferJobs.create.yields(error);

  sample.program.createTransferJob({}, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should get a transfer job`, t => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.getTransferJob(jobName, callback);

  t.true(sample.mocks.storagetransfer.transferJobs.get.calledOnce);
  t.deepEqual(
    sample.mocks.storagetransfer.transferJobs.get.firstCall.args.slice(0, -1),
    [
      {
        auth: {},
        projectId: process.env.GCLOUD_PROJECT,
        jobName: jobName,
      },
    ]
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [null, sample.mocks.transferJob]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [
    `Found transfer job: %s`,
    sample.mocks.transferJob.name,
  ]);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.getTransferJob(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle get error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferJobs.get.yields(error);

  sample.program.getTransferJob(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should update a transfer job`, t => {
  const sample = getSample();
  const callback = sinon.stub();
  const options = {
    job: jobName,
    field: `status`,
    value: `DISABLED`,
  };

  sample.program.updateTransferJob(options, callback);

  t.true(sample.mocks.storagetransfer.transferJobs.patch.calledOnce);
  t.deepEqual(
    sample.mocks.storagetransfer.transferJobs.patch.firstCall.args.slice(0, -1),
    [
      {
        auth: {},
        jobName: jobName,
        resource: {
          projectId: process.env.GCLOUD_PROJECT,
          transferJob: {
            name: jobName,
            status: options.value,
          },
          updateTransferJobFieldMask: options.field,
        },
      },
    ]
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [null, sample.mocks.transferJob]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [
    `Updated transfer job: %s`,
    jobName,
  ]);

  options.field = `description`;
  options.value = `description`;

  sample.program.updateTransferJob(options, callback);

  t.true(sample.mocks.storagetransfer.transferJobs.patch.calledTwice);
  t.deepEqual(
    sample.mocks.storagetransfer.transferJobs.patch.secondCall.args.slice(
      0,
      -1
    ),
    [
      {
        auth: {},
        jobName: jobName,
        resource: {
          projectId: process.env.GCLOUD_PROJECT,
          transferJob: {
            name: jobName,
            description: options.value,
          },
          updateTransferJobFieldMask: options.field,
        },
      },
    ]
  );
  t.true(callback.calledTwice);
  t.deepEqual(callback.secondCall.args, [null, sample.mocks.transferJob]);
  t.true(console.log.calledTwice);
  t.deepEqual(console.log.secondCall.args, [
    `Updated transfer job: %s`,
    jobName,
  ]);

  options.field = `transferSpec`;
  options.value = `{"foo":"bar"}`;

  sample.program.updateTransferJob(options, callback);

  t.true(sample.mocks.storagetransfer.transferJobs.patch.calledThrice);
  t.deepEqual(
    sample.mocks.storagetransfer.transferJobs.patch.thirdCall.args.slice(0, -1),
    [
      {
        auth: {},
        jobName: jobName,
        resource: {
          projectId: process.env.GCLOUD_PROJECT,
          transferJob: {
            name: jobName,
            transferSpec: JSON.parse(options.value),
          },
          updateTransferJobFieldMask: options.field,
        },
      },
    ]
  );
  t.true(callback.calledThrice);
  t.deepEqual(callback.thirdCall.args, [null, sample.mocks.transferJob]);
  t.true(console.log.calledThrice);
  t.deepEqual(console.log.thirdCall.args, [
    `Updated transfer job: %s`,
    jobName,
  ]);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  const options = {
    job: jobName,
    field: `status`,
    value: `DISABLED`,
  };
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.updateTransferJob(options, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle patch error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  const options = {
    job: jobName,
    field: `status`,
    value: `DISABLED`,
  };
  sample.mocks.storagetransfer.transferJobs.patch.yields(error);

  sample.program.updateTransferJob(options, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should list transfer jobs`, t => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.listTransferJobs(callback);

  t.true(sample.mocks.storagetransfer.transferJobs.list.calledOnce);
  t.deepEqual(
    sample.mocks.storagetransfer.transferJobs.list.firstCall.args.slice(0, -1),
    [
      {
        auth: {},
        filter: JSON.stringify({project_id: process.env.GCLOUD_PROJECT}),
      },
    ]
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [null, [sample.mocks.transferJob]]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [`Found %d jobs!`, 1]);

  sample.mocks.storagetransfer.transferJobs.list.yields(null, {});
  sample.program.listTransferJobs(callback);

  t.true(sample.mocks.storagetransfer.transferJobs.list.calledTwice);
  t.deepEqual(
    sample.mocks.storagetransfer.transferJobs.list.secondCall.args.slice(0, -1),
    [
      {
        auth: {},
        filter: JSON.stringify({project_id: process.env.GCLOUD_PROJECT}),
      },
    ]
  );
  t.true(callback.calledTwice);
  t.deepEqual(callback.secondCall.args, [null, []]);
  t.true(console.log.calledOnce);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.listTransferJobs(callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle list error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferJobs.list.yields(error);

  sample.program.listTransferJobs(callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should list transfer operations`, t => {
  const sample = getSample();
  const callback = sinon.stub();

  // Test that all operations get listed
  sample.program.listTransferOperations(undefined, callback);

  t.true(sample.mocks.storagetransfer.transferOperations.list.calledOnce);
  t.deepEqual(
    sample.mocks.storagetransfer.transferOperations.list.firstCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: `transferOperations`,
        auth: {},
        filter: JSON.stringify({project_id: process.env.GCLOUD_PROJECT}),
      },
    ]
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [
    null,
    [sample.mocks.transferOperation],
  ]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [`Found %d operations!`, 1]);

  // Test that operations for a specific job get listed
  sample.program.listTransferOperations(jobName, callback);

  t.true(sample.mocks.storagetransfer.transferOperations.list.calledTwice);
  t.deepEqual(
    sample.mocks.storagetransfer.transferOperations.list.secondCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: `transferOperations`,
        auth: {},
        filter: JSON.stringify({
          project_id: process.env.GCLOUD_PROJECT,
          job_names: [jobName],
        }),
      },
    ]
  );
  t.true(callback.calledTwice);
  t.deepEqual(callback.secondCall.args, [
    null,
    [sample.mocks.transferOperation],
  ]);
  t.true(console.log.calledTwice);
  t.deepEqual(console.log.secondCall.args, [`Found %d operations!`, 1]);

  // Test that operations for a specific job get listed when the API response with just an object
  sample.mocks.storagetransfer.transferOperations.list.yields(null, {});
  sample.program.listTransferOperations(jobName, callback);

  t.true(sample.mocks.storagetransfer.transferOperations.list.calledThrice);
  t.deepEqual(
    sample.mocks.storagetransfer.transferOperations.list.thirdCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: `transferOperations`,
        auth: {},
        filter: JSON.stringify({
          project_id: process.env.GCLOUD_PROJECT,
          job_names: [jobName],
        }),
      },
    ]
  );
  t.true(callback.calledThrice);
  t.deepEqual(callback.thirdCall.args, [null, []]);
  t.true(console.log.calledTwice);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.listTransferOperations(undefined, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle list error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.list.yields(error);

  sample.program.listTransferOperations(undefined, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should get a transfer operation`, t => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.getTransferOperation(transferOperationName, callback);

  t.true(callback.calledOnce);
  t.is(callback.firstCall.args.length, 2, `callback received 2 arguments`);
  t.ifError(callback.firstCall.args[0], `callback did not receive error`);
  t.true(callback.firstCall.args[1] === sample.mocks.transferOperation);

  t.true(sample.mocks.storagetransfer.transferOperations.get.calledOnce);
  t.deepEqual(
    sample.mocks.storagetransfer.transferOperations.get.firstCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: transferOperationName,
        auth: {},
      },
    ]
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [null, sample.mocks.transferOperation]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [
    `Found transfer operation: %s`,
    sample.mocks.transferOperation,
  ]);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.getTransferOperation(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle get error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.get.yields(error);

  sample.program.getTransferOperation(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should pause a transfer operation`, t => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.pauseTransferOperation(transferOperationName, callback);

  t.true(callback.calledOnce);
  t.is(callback.firstCall.args.length, 1, `callback received 1 argument`);
  t.ifError(callback.firstCall.args[0], `callback did not receive error`);

  t.true(sample.mocks.storagetransfer.transferOperations.pause.calledOnce);
  t.deepEqual(
    sample.mocks.storagetransfer.transferOperations.pause.firstCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: transferOperationName,
        auth: {},
      },
    ]
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [null]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [
    `Paused transfer operation: %s`,
    transferOperationName,
  ]);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.pauseTransferOperation(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle pause error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.pause.yields(error);

  sample.program.pauseTransferOperation(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should resume a transfer operation`, t => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.resumeTransferOperation(transferOperationName, callback);

  t.true(callback.calledOnce);
  t.is(callback.firstCall.args.length, 1, `callback received 1 argument`);
  t.ifError(callback.firstCall.args[0], `callback did not receive error`);

  t.true(sample.mocks.storagetransfer.transferOperations.resume.calledOnce);
  t.deepEqual(
    sample.mocks.storagetransfer.transferOperations.resume.firstCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: transferOperationName,
        auth: {},
      },
    ]
  );
  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [null]);
  t.true(console.log.calledOnce);
  t.deepEqual(console.log.firstCall.args, [
    `Resumed transfer operation: %s`,
    transferOperationName,
  ]);
});

test.serial(`should handle auth error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.resumeTransferOperation(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should handle resume error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.resume.yields(error);

  sample.program.resumeTransferOperation(jobName, callback);

  t.true(callback.calledOnce);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should call createTransferJob`, t => {
  const program = getSample().program;

  sinon.stub(program, `createTransferJob`);
  program.main([
    `jobs`,
    `create`,
    srcBucketName,
    destBucketName,
    `time`,
    `date`,
  ]);
  t.true(program.createTransferJob.calledOnce);
  t.deepEqual(program.createTransferJob.firstCall.args.slice(0, -1), [
    {
      srcBucket: srcBucketName,
      destBucket: destBucketName,
      time: `time`,
      date: `date`,
      description: undefined,
    },
  ]);
});

test.serial(`should call getTransferJob`, t => {
  const program = getSample().program;

  sinon.stub(program, `getTransferJob`);
  program.main([`jobs`, `get`, jobName]);
  t.true(program.getTransferJob.calledOnce);
  t.deepEqual(program.getTransferJob.firstCall.args.slice(0, -1), [jobName]);
});

test.serial(`should call listTransferJobs`, t => {
  const program = getSample().program;

  sinon.stub(program, `listTransferJobs`);
  program.main([`jobs`, `list`]);
  t.true(program.listTransferJobs.calledOnce);
  t.deepEqual(program.listTransferJobs.firstCall.args.slice(0, -1), []);
});

test.serial(`should call updateTransferJob`, t => {
  const program = getSample().program;

  sinon.stub(program, `updateTransferJob`);
  program.main([`jobs`, `set`, jobName, `status`, `DISABLED`]);
  t.true(program.updateTransferJob.calledOnce);
  t.deepEqual(program.updateTransferJob.firstCall.args.slice(0, -1), [
    {
      job: jobName,
      field: `status`,
      value: `DISABLED`,
    },
  ]);
});

test.serial(`should call listTransferOperations`, t => {
  const program = getSample().program;

  sinon.stub(program, `listTransferOperations`);
  program.main([`operations`, `list`]);
  t.true(program.listTransferOperations.calledOnce);
  t.deepEqual(program.listTransferOperations.firstCall.args.slice(0, -1), [
    undefined,
  ]);
});

test.serial(`should call listTransferOperations and filter`, t => {
  const program = getSample().program;

  sinon.stub(program, `listTransferOperations`);
  program.main([`operations`, `list`, jobName]);
  t.true(program.listTransferOperations.calledOnce);
  t.deepEqual(program.listTransferOperations.firstCall.args.slice(0, -1), [
    jobName,
  ]);
});

test.serial(`should call getTransferOperation`, t => {
  const program = getSample().program;

  sinon.stub(program, `getTransferOperation`);
  program.main([`operations`, `get`, transferOperationName]);
  t.true(program.getTransferOperation.calledOnce);
  t.deepEqual(program.getTransferOperation.firstCall.args.slice(0, -1), [
    transferOperationName,
  ]);
});

test.serial(`should call pauseTransferOperation`, t => {
  const program = getSample().program;

  sinon.stub(program, `pauseTransferOperation`);
  program.main([`operations`, `pause`, transferOperationName]);
  t.true(program.pauseTransferOperation.calledOnce);
  t.deepEqual(program.pauseTransferOperation.firstCall.args.slice(0, -1), [
    transferOperationName,
  ]);
});

test.serial(`should call resumeTransferOperation`, t => {
  const program = getSample().program;

  sinon.stub(program, `resumeTransferOperation`);
  program.main([`operations`, `resume`, transferOperationName]);
  t.true(program.resumeTransferOperation.calledOnce);
  t.deepEqual(program.resumeTransferOperation.firstCall.args.slice(0, -1), [
    transferOperationName,
  ]);
});
