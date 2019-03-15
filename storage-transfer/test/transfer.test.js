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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const srcBucketName = 'foo';
const destBucketName = 'bar';
const jobName = 'transferJobs/123456789012345678';
const transferOperationName = 'transferOperations/123456789012345678';

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
    program: proxyquire('../transfer', {
      googleapis: googleapisMock,
      yargs: proxyquire('yargs', {}),
    }),
    mocks: {
      googleapis: googleapisMock,
      storagetransfer: storagetransferMock,
      transferJob: transferJobMock,
      transferOperation: transferOperationMock,
    },
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('should create a transfer job', () => {
  const description = 'description';
  const sample = getSample();
  const callback = sinon.stub();
  const date = '2016/08/11';
  const time = '15:30';
  const options = {
    srcBucket: srcBucketName,
    destBucket: destBucketName,
    date: date,
    time: time,
  };

  sample.program.createTransferJob(options, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.create.calledOnce,
    true
  );
  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.create.firstCall.args[0].resource
      .description,
    undefined
  );
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [
    null,
    sample.mocks.transferJob,
  ]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, [
    'Created transfer job: %s',
    sample.mocks.transferJob.name,
  ]);

  options.description = description;
  sample.program.createTransferJob(options, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.create.calledTwice,
    true
  );
  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.create.secondCall.args[0].resource
      .description,
    description
  );
  assert.strictEqual(callback.calledTwice, true);
  assert.deepStrictEqual(callback.secondCall.args, [
    null,
    sample.mocks.transferJob,
  ]);
  assert.strictEqual(console.log.calledTwice, true);
  assert.deepStrictEqual(console.log.secondCall.args, [
    'Created transfer job: %s',
    sample.mocks.transferJob.name,
  ]);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.createTransferJob({}, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle create error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferJobs.create.yields(error);

  sample.program.createTransferJob({}, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should get a transfer job', () => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.getTransferJob(jobName, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.get.calledOnce,
    true
  );
  assert.deepStrictEqual(
    sample.mocks.storagetransfer.transferJobs.get.firstCall.args.slice(0, -1),
    [
      {
        auth: {},
        projectId: process.env.GCLOUD_PROJECT,
        jobName: jobName,
      },
    ]
  );
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [
    null,
    sample.mocks.transferJob,
  ]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, [
    'Found transfer job: %s',
    sample.mocks.transferJob.name,
  ]);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.getTransferJob(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle get error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferJobs.get.yields(error);

  sample.program.getTransferJob(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should update a transfer job', () => {
  const sample = getSample();
  const callback = sinon.stub();
  const options = {
    job: jobName,
    field: 'status',
    value: 'DISABLED',
  };

  sample.program.updateTransferJob(options, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.patch.calledOnce,
    true
  );
  assert.deepStrictEqual(
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
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [
    null,
    sample.mocks.transferJob,
  ]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, [
    'Updated transfer job: %s',
    jobName,
  ]);

  options.field = 'description';
  options.value = 'description';

  sample.program.updateTransferJob(options, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.patch.calledTwice,
    true
  );
  assert.deepStrictEqual(
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
  assert.strictEqual(callback.calledTwice, true);
  assert.deepStrictEqual(callback.secondCall.args, [
    null,
    sample.mocks.transferJob,
  ]);
  assert.strictEqual(console.log.calledTwice, true);
  assert.deepStrictEqual(console.log.secondCall.args, [
    'Updated transfer job: %s',
    jobName,
  ]);

  options.field = 'transferSpec';
  options.value = '{"foo":"bar"}';

  sample.program.updateTransferJob(options, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.patch.calledThrice,
    true
  );
  assert.deepStrictEqual(
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
  assert.strictEqual(callback.calledThrice, true);
  assert.deepStrictEqual(callback.thirdCall.args, [
    null,
    sample.mocks.transferJob,
  ]);
  assert.strictEqual(console.log.calledThrice, true);
  assert.deepStrictEqual(console.log.thirdCall.args, [
    'Updated transfer job: %s',
    jobName,
  ]);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  const options = {
    job: jobName,
    field: 'status',
    value: 'DISABLED',
  };
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.updateTransferJob(options, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle patch error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  const options = {
    job: jobName,
    field: 'status',
    value: 'DISABLED',
  };
  sample.mocks.storagetransfer.transferJobs.patch.yields(error);

  sample.program.updateTransferJob(options, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should list transfer jobs', () => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.listTransferJobs(callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.list.calledOnce,
    true
  );
  assert.deepStrictEqual(
    sample.mocks.storagetransfer.transferJobs.list.firstCall.args.slice(0, -1),
    [
      {
        auth: {},
        filter: JSON.stringify({project_id: process.env.GCLOUD_PROJECT}),
      },
    ]
  );
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [
    null,
    [sample.mocks.transferJob],
  ]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, ['Found %d jobs!', 1]);

  sample.mocks.storagetransfer.transferJobs.list.yields(null, {});
  sample.program.listTransferJobs(callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferJobs.list.calledTwice,
    true
  );
  assert.deepStrictEqual(
    sample.mocks.storagetransfer.transferJobs.list.secondCall.args.slice(0, -1),
    [
      {
        auth: {},
        filter: JSON.stringify({project_id: process.env.GCLOUD_PROJECT}),
      },
    ]
  );
  assert.strictEqual(callback.calledTwice, true);
  assert.deepStrictEqual(callback.secondCall.args, [null, []]);
  assert.strictEqual(console.log.calledOnce, true);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.listTransferJobs(callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle list error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferJobs.list.yields(error);

  sample.program.listTransferJobs(callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should list transfer operations', () => {
  const sample = getSample();
  const callback = sinon.stub();

  // Test that all operations get listed
  sample.program.listTransferOperations(undefined, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferOperations.list.calledOnce,
    true
  );
  assert.deepStrictEqual(
    sample.mocks.storagetransfer.transferOperations.list.firstCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: 'transferOperations',
        auth: {},
        filter: JSON.stringify({project_id: process.env.GCLOUD_PROJECT}),
      },
    ]
  );
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [
    null,
    [sample.mocks.transferOperation],
  ]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, [
    'Found %d operations!',
    1,
  ]);

  // Test that operations for a specific job get listed
  sample.program.listTransferOperations(jobName, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferOperations.list.calledTwice,
    true
  );
  assert.deepStrictEqual(
    sample.mocks.storagetransfer.transferOperations.list.secondCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: 'transferOperations',
        auth: {},
        filter: JSON.stringify({
          project_id: process.env.GCLOUD_PROJECT,
          job_names: [jobName],
        }),
      },
    ]
  );
  assert.strictEqual(callback.calledTwice, true);
  assert.deepStrictEqual(callback.secondCall.args, [
    null,
    [sample.mocks.transferOperation],
  ]);
  assert.strictEqual(console.log.calledTwice, true);
  assert.deepStrictEqual(console.log.secondCall.args, [
    'Found %d operations!',
    1,
  ]);

  // Test that operations for a specific job get listed when the API response with just an object
  sample.mocks.storagetransfer.transferOperations.list.yields(null, {});
  sample.program.listTransferOperations(jobName, callback);

  assert.strictEqual(
    sample.mocks.storagetransfer.transferOperations.list.calledThrice,
    true
  );
  assert.deepStrictEqual(
    sample.mocks.storagetransfer.transferOperations.list.thirdCall.args.slice(
      0,
      -1
    ),
    [
      {
        name: 'transferOperations',
        auth: {},
        filter: JSON.stringify({
          project_id: process.env.GCLOUD_PROJECT,
          job_names: [jobName],
        }),
      },
    ]
  );
  assert.strictEqual(callback.calledThrice, true);
  assert.deepStrictEqual(callback.thirdCall.args, [null, []]);
  assert.strictEqual(console.log.calledTwice, true);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.listTransferOperations(undefined, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle list error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.list.yields(error);

  sample.program.listTransferOperations(undefined, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should get a transfer operation', () => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.getTransferOperation(transferOperationName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.strictEqual(
    callback.firstCall.args.length,
    2,
    'callback received 2 arguments'
  );
  assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
  assert.strictEqual(
    callback.firstCall.args[1] === sample.mocks.transferOperation,
    true
  );

  assert.strictEqual(
    sample.mocks.storagetransfer.transferOperations.get.calledOnce,
    true
  );
  assert.deepStrictEqual(
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
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [
    null,
    sample.mocks.transferOperation,
  ]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, [
    'Found transfer operation: %s',
    sample.mocks.transferOperation,
  ]);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.getTransferOperation(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle get error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.get.yields(error);

  sample.program.getTransferOperation(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should pause a transfer operation', () => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.pauseTransferOperation(transferOperationName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.strictEqual(
    callback.firstCall.args.length,
    1,
    'callback received 1 argument'
  );
  assert.ifError(callback.firstCall.args[0], 'callback did not receive error');

  assert.strictEqual(
    sample.mocks.storagetransfer.transferOperations.pause.calledOnce,
    true
  );
  assert.deepStrictEqual(
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
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [null]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, [
    'Paused transfer operation: %s',
    transferOperationName,
  ]);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.pauseTransferOperation(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle pause error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.pause.yields(error);

  sample.program.pauseTransferOperation(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should resume a transfer operation', () => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.resumeTransferOperation(transferOperationName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.strictEqual(
    callback.firstCall.args.length,
    1,
    'callback received 1 argument'
  );
  assert.ifError(callback.firstCall.args[0], 'callback did not receive error');

  assert.strictEqual(
    sample.mocks.storagetransfer.transferOperations.resume.calledOnce,
    true
  );
  assert.deepStrictEqual(
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
  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [null]);
  assert.strictEqual(console.log.calledOnce, true);
  assert.deepStrictEqual(console.log.firstCall.args, [
    'Resumed transfer operation: %s',
    transferOperationName,
  ]);
});

it('should handle auth error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.googleapis.google.auth.getApplicationDefault.yields(error);

  sample.program.resumeTransferOperation(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should handle resume error', () => {
  const error = new Error('error');
  const sample = getSample();
  const callback = sinon.stub();
  sample.mocks.storagetransfer.transferOperations.resume.yields(error);

  sample.program.resumeTransferOperation(jobName, callback);

  assert.strictEqual(callback.calledOnce, true);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should call createTransferJob', () => {
  const program = getSample().program;

  sinon.stub(program, 'createTransferJob');
  program.main([
    'jobs',
    'create',
    srcBucketName,
    destBucketName,
    'time',
    'date',
  ]);
  assert.strictEqual(program.createTransferJob.calledOnce, true);
  assert.deepStrictEqual(
    program.createTransferJob.firstCall.args.slice(0, -1),
    [
      {
        srcBucket: srcBucketName,
        destBucket: destBucketName,
        time: 'time',
        date: 'date',
        description: undefined,
      },
    ]
  );
});

it('should call getTransferJob', () => {
  const program = getSample().program;

  sinon.stub(program, 'getTransferJob');
  program.main(['jobs', 'get', jobName]);
  assert.strictEqual(program.getTransferJob.calledOnce, true);
  assert.deepStrictEqual(program.getTransferJob.firstCall.args.slice(0, -1), [
    jobName,
  ]);
});

it('should call listTransferJobs', () => {
  const program = getSample().program;

  sinon.stub(program, 'listTransferJobs');
  program.main(['jobs', 'list']);
  assert.strictEqual(program.listTransferJobs.calledOnce, true);
  assert.deepStrictEqual(
    program.listTransferJobs.firstCall.args.slice(0, -1),
    []
  );
});

it('should call updateTransferJob', () => {
  const program = getSample().program;

  sinon.stub(program, 'updateTransferJob');
  program.main(['jobs', 'set', jobName, 'status', 'DISABLED']);
  assert.strictEqual(program.updateTransferJob.calledOnce, true);
  assert.deepStrictEqual(
    program.updateTransferJob.firstCall.args.slice(0, -1),
    [
      {
        job: jobName,
        field: 'status',
        value: 'DISABLED',
      },
    ]
  );
});

it('should call listTransferOperations', () => {
  const program = getSample().program;

  sinon.stub(program, 'listTransferOperations');
  program.main(['operations', 'list']);
  assert.strictEqual(program.listTransferOperations.calledOnce, true);
  assert.deepStrictEqual(
    program.listTransferOperations.firstCall.args.slice(0, -1),
    [undefined]
  );
});

it('should call listTransferOperations and filter', () => {
  const program = getSample().program;

  sinon.stub(program, 'listTransferOperations');
  program.main(['operations', 'list', jobName]);
  assert.strictEqual(program.listTransferOperations.calledOnce, true);
  assert.deepStrictEqual(
    program.listTransferOperations.firstCall.args.slice(0, -1),
    [jobName]
  );
});

it('should call getTransferOperation', () => {
  const program = getSample().program;

  sinon.stub(program, 'getTransferOperation');
  program.main(['operations', 'get', transferOperationName]);
  assert.strictEqual(program.getTransferOperation.calledOnce, true);
  assert.deepStrictEqual(
    program.getTransferOperation.firstCall.args.slice(0, -1),
    [transferOperationName]
  );
});

it('should call pauseTransferOperation', () => {
  const program = getSample().program;

  sinon.stub(program, 'pauseTransferOperation');
  program.main(['operations', 'pause', transferOperationName]);
  assert.strictEqual(program.pauseTransferOperation.calledOnce, true);
  assert.deepStrictEqual(
    program.pauseTransferOperation.firstCall.args.slice(0, -1),
    [transferOperationName]
  );
});

it('should call resumeTransferOperation', () => {
  const program = getSample().program;

  sinon.stub(program, 'resumeTransferOperation');
  program.main(['operations', 'resume', transferOperationName]);
  assert.strictEqual(program.resumeTransferOperation.calledOnce, true);
  assert.deepStrictEqual(
    program.resumeTransferOperation.firstCall.args.slice(0, -1),
    [transferOperationName]
  );
});
