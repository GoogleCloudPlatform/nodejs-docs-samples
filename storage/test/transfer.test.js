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

var proxyquire = require('proxyquire').noCallThru();
var srcBucketName = 'foo';
var destBucketName = 'bar';
var jobName = 'transferJobs/123456789012345678';
var transferOperationName = 'transferOperations/123456789012345678';

function getSample () {
  var transferJobMock = {
    name: jobName
  };
  var transferOperationMock = {};
  var storagetransferMock = {
    transferJobs: {
      create: sinon.stub().yields(null, transferJobMock),
      get: sinon.stub().yields(null, transferJobMock),
      patch: sinon.stub().yields(null, transferJobMock),
      list: sinon.stub().yields(null, { transferJobs: [transferJobMock] })
    },
    transferOperations: {
      get: sinon.stub().yields(null, transferOperationMock),
      pause: sinon.stub().yields(null, transferOperationMock),
      resume: sinon.stub().yields(null, transferOperationMock),
      list: sinon.stub().yields(null, { operations: [transferOperationMock] })
    }
  };
  var googleapisMock = {
    storagetransfer: sinon.stub().returns(storagetransferMock),
    auth: {
      getApplicationDefault: sinon.stub().yields(null, {})
    }
  };

  return {
    program: proxyquire('../transfer', {
      googleapis: googleapisMock,
      yargs: proxyquire('yargs', {})
    }),
    mocks: {
      googleapis: googleapisMock,
      storagetransfer: storagetransferMock,
      transferJob: transferJobMock,
      transferOperation: transferOperationMock
    }
  };
}

describe('storage:transfer', function () {
  describe('jobs', function () {
    describe('create', function () {
      it('should create a transfer job', function () {
        var description = 'description';
        var sample = getSample();
        var callback = sinon.stub();
        var date = '2016/08/11';
        var time = '15:30';
        var options = {
          srcBucket: srcBucketName,
          destBucket: destBucketName,
          date: date,
          time: time
        };

        sample.program.createTransferJob(options, callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.create.calledOnce, true);
        assert.equal(sample.mocks.storagetransfer.transferJobs.create.firstCall.args[0].resource.description, undefined);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null, sample.mocks.transferJob]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Created transfer job: %s', sample.mocks.transferJob.name]);

        options.description = description;
        sample.program.createTransferJob(options, callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.create.calledTwice, true);
        assert.equal(sample.mocks.storagetransfer.transferJobs.create.secondCall.args[0].resource.description, description);
        assert.equal(callback.calledTwice, true);
        assert.deepEqual(callback.secondCall.args, [null, sample.mocks.transferJob]);
        assert.equal(console.log.calledTwice, true);
        assert.deepEqual(console.log.secondCall.args, ['Created transfer job: %s', sample.mocks.transferJob.name]);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.createTransferJob({}, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle create error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferJobs.create.yields(error);

        sample.program.createTransferJob({}, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });

    describe('get', function () {
      it('should get a transfer job', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.getTransferJob(jobName, callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.get.calledOnce, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferJobs.get.firstCall.args.slice(0, -1), [{
          auth: {},
          projectId: process.env.GCLOUD_PROJECT,
          jobName: jobName
        }]);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null, sample.mocks.transferJob]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found transfer job: %s', sample.mocks.transferJob.name]);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.getTransferJob(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle get error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferJobs.get.yields(error);

        sample.program.getTransferJob(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });

    describe('set', function () {
      it('should update a transfer job', function () {
        var sample = getSample();
        var callback = sinon.stub();
        var options = {
          job: jobName,
          field: 'status',
          value: 'DISABLED'
        };

        sample.program.updateTransferJob(options, callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.patch.calledOnce, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferJobs.patch.firstCall.args.slice(0, -1), [{
          auth: {},
          jobName: jobName,
          resource: {
            projectId: process.env.GCLOUD_PROJECT,
            transferJob: {
              name: jobName,
              status: options.value
            },
            updateTransferJobFieldMask: options.field
          }
        }]);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null, sample.mocks.transferJob]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Updated transfer job: %s', jobName]);

        options.field = 'description';
        options.value = 'description';

        sample.program.updateTransferJob(options, callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.patch.calledTwice, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferJobs.patch.secondCall.args.slice(0, -1), [{
          auth: {},
          jobName: jobName,
          resource: {
            projectId: process.env.GCLOUD_PROJECT,
            transferJob: {
              name: jobName,
              description: options.value
            },
            updateTransferJobFieldMask: options.field
          }
        }]);
        assert.equal(callback.calledTwice, true);
        assert.deepEqual(callback.secondCall.args, [null, sample.mocks.transferJob]);
        assert.equal(console.log.calledTwice, true);
        assert.deepEqual(console.log.secondCall.args, ['Updated transfer job: %s', jobName]);

        options.field = 'transferSpec';
        options.value = '{"foo":"bar"}';

        sample.program.updateTransferJob(options, callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.patch.calledThrice, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferJobs.patch.thirdCall.args.slice(0, -1), [{
          auth: {},
          jobName: jobName,
          resource: {
            projectId: process.env.GCLOUD_PROJECT,
            transferJob: {
              name: jobName,
              transferSpec: JSON.parse(options.value)
            },
            updateTransferJobFieldMask: options.field
          }
        }]);
        assert.equal(callback.calledThrice, true);
        assert.deepEqual(callback.thirdCall.args, [null, sample.mocks.transferJob]);
        assert.equal(console.log.calledThrice, true);
        assert.deepEqual(console.log.thirdCall.args, ['Updated transfer job: %s', jobName]);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        var options = {
          job: jobName,
          field: 'status',
          value: 'DISABLED'
        };
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.updateTransferJob(options, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle patch error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        var options = {
          job: jobName,
          field: 'status',
          value: 'DISABLED'
        };
        sample.mocks.storagetransfer.transferJobs.patch.yields(error);

        sample.program.updateTransferJob(options, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });

    describe('list', function () {
      it('should list transfer jobs', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.listTransferJobs(callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.list.calledOnce, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferJobs.list.firstCall.args.slice(0, -1), [{
          auth: {},
          filter: JSON.stringify({ project_id: process.env.GCLOUD_PROJECT })
        }]);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null, [sample.mocks.transferJob]]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found %d jobs!', 1]);

        sample.mocks.storagetransfer.transferJobs.list.yields(null, {});
        sample.program.listTransferJobs(callback);

        assert.equal(sample.mocks.storagetransfer.transferJobs.list.calledTwice, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferJobs.list.secondCall.args.slice(0, -1), [{
          auth: {},
          filter: JSON.stringify({ project_id: process.env.GCLOUD_PROJECT })
        }]);
        assert.equal(callback.calledTwice, true);
        assert.deepEqual(callback.secondCall.args, [null, []]);
        assert.equal(console.log.calledOnce, true);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.listTransferJobs(callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle list error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferJobs.list.yields(error);

        sample.program.listTransferJobs(callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });
  });

  describe('operations', function () {
    describe('list', function () {
      it('should list transfer operations', function () {
        var sample = getSample();
        var callback = sinon.stub();

        // Test that all operations get listed
        sample.program.listTransferOperations(undefined, callback);

        assert.equal(sample.mocks.storagetransfer.transferOperations.list.calledOnce, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferOperations.list.firstCall.args.slice(0, -1), [{
          name: 'transferOperations',
          auth: {},
          filter: JSON.stringify({ project_id: process.env.GCLOUD_PROJECT })
        }]);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null, [sample.mocks.transferOperation]]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found %d operations!', 1]);

        // Test that operations for a specific job get listed
        sample.program.listTransferOperations(jobName, callback);

        assert.equal(sample.mocks.storagetransfer.transferOperations.list.calledTwice, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferOperations.list.secondCall.args.slice(0, -1), [{
          name: 'transferOperations',
          auth: {},
          filter: JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, job_names: [jobName] })
        }]);
        assert.equal(callback.calledTwice, true);
        assert.deepEqual(callback.secondCall.args, [null, [sample.mocks.transferOperation]]);
        assert.equal(console.log.calledTwice, true);
        assert.deepEqual(console.log.secondCall.args, ['Found %d operations!', 1]);

        // Test that operations for a specific job get listed when the API response with just an object
        sample.mocks.storagetransfer.transferOperations.list.yields(null, {});
        sample.program.listTransferOperations(jobName, callback);

        assert.equal(sample.mocks.storagetransfer.transferOperations.list.calledThrice, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferOperations.list.thirdCall.args.slice(0, -1), [{
          name: 'transferOperations',
          auth: {},
          filter: JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, job_names: [jobName] })
        }]);
        assert.equal(callback.calledThrice, true);
        assert.deepEqual(callback.thirdCall.args, [null, []]);
        assert.equal(console.log.calledTwice, true);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.listTransferOperations(undefined, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle list error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.list.yields(error);

        sample.program.listTransferOperations(undefined, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });

    describe('get', function () {
      it('should get a transfer operation', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.getTransferOperation(transferOperationName, callback);

        assert.equal(callback.calledOnce, true);
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.firstCall.args[1], sample.mocks.transferOperation, 'callback received transfer operation');

        assert.equal(sample.mocks.storagetransfer.transferOperations.get.calledOnce, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferOperations.get.firstCall.args.slice(0, -1), [{
          name: transferOperationName,
          auth: {}
        }]);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null, sample.mocks.transferOperation]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found transfer operation: %s', sample.mocks.transferOperation]);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.getTransferOperation(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle get error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.get.yields(error);

        sample.program.getTransferOperation(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });

    describe('pause', function () {
      it('should pause a transfer operation', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.pauseTransferOperation(transferOperationName, callback);

        assert.equal(callback.calledOnce, true);
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');

        assert.equal(sample.mocks.storagetransfer.transferOperations.pause.calledOnce, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferOperations.pause.firstCall.args.slice(0, -1), [{
          name: transferOperationName,
          auth: {}
        }]);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Paused transfer operation: %s', transferOperationName]);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.pauseTransferOperation(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle pause error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.pause.yields(error);

        sample.program.pauseTransferOperation(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });

    describe('resume', function () {
      it('should resume a transfer operation', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.resumeTransferOperation(transferOperationName, callback);

        assert.equal(callback.calledOnce, true);
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');

        assert.equal(sample.mocks.storagetransfer.transferOperations.resume.calledOnce, true);
        assert.deepEqual(sample.mocks.storagetransfer.transferOperations.resume.firstCall.args.slice(0, -1), [{
          name: transferOperationName,
          auth: {}
        }]);
        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [null]);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Resumed transfer operation: %s', transferOperationName]);
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.yields(error);

        sample.program.resumeTransferOperation(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });

      it('should handle resume error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.resume.yields(error);

        sample.program.resumeTransferOperation(jobName, callback);

        assert.equal(callback.calledOnce, true);
        assert.deepEqual(callback.firstCall.args, [error]);
      });
    });
  });

  describe('main', function () {
    it('should call createTransferJob', function () {
      var program = getSample().program;

      sinon.stub(program, 'createTransferJob');
      program.main(['jobs', 'create', srcBucketName, destBucketName, 'time', 'date']);
      assert.equal(program.createTransferJob.calledOnce, true);
      assert.deepEqual(program.createTransferJob.firstCall.args.slice(0, -1), [{
        srcBucket: srcBucketName,
        destBucket: destBucketName,
        time: 'time',
        date: 'date',
        description: undefined
      }]);
    });

    it('should call getTransferJob', function () {
      var program = getSample().program;

      sinon.stub(program, 'getTransferJob');
      program.main(['jobs', 'get', jobName]);
      assert.equal(program.getTransferJob.calledOnce, true);
      assert.deepEqual(program.getTransferJob.firstCall.args.slice(0, -1), [jobName]);
    });

    it('should call listTransferJobs', function () {
      var program = getSample().program;

      sinon.stub(program, 'listTransferJobs');
      program.main(['jobs', 'list']);
      assert.equal(program.listTransferJobs.calledOnce, true);
      assert.deepEqual(program.listTransferJobs.firstCall.args.slice(0, -1), []);
    });

    it('should call updateTransferJob', function () {
      var program = getSample().program;

      sinon.stub(program, 'updateTransferJob');
      program.main(['jobs', 'set', jobName, 'status', 'DISABLED']);
      assert.equal(program.updateTransferJob.calledOnce, true);
      assert.deepEqual(program.updateTransferJob.firstCall.args.slice(0, -1), [{
        job: jobName,
        field: 'status',
        value: 'DISABLED'
      }]);
    });

    it('should call listTransferOperations', function () {
      var program = getSample().program;

      sinon.stub(program, 'listTransferOperations');
      program.main(['operations', 'list']);
      assert.equal(program.listTransferOperations.calledOnce, true);
      assert.deepEqual(program.listTransferOperations.firstCall.args.slice(0, -1), [undefined]);
    });

    it('should call listTransferOperations and filter', function () {
      var program = getSample().program;

      sinon.stub(program, 'listTransferOperations');
      program.main(['operations', 'list', jobName]);
      assert.equal(program.listTransferOperations.calledOnce, true);
      assert.deepEqual(program.listTransferOperations.firstCall.args.slice(0, -1), [jobName]);
    });

    it('should call getTransferOperation', function () {
      var program = getSample().program;

      sinon.stub(program, 'getTransferOperation');
      program.main(['operations', 'get', transferOperationName]);
      assert.equal(program.getTransferOperation.calledOnce, true);
      assert.deepEqual(program.getTransferOperation.firstCall.args.slice(0, -1), [transferOperationName]);
    });

    it('should call pauseTransferOperation', function () {
      var program = getSample().program;

      sinon.stub(program, 'pauseTransferOperation');
      program.main(['operations', 'pause', transferOperationName]);
      assert.equal(program.pauseTransferOperation.calledOnce, true);
      assert.deepEqual(program.pauseTransferOperation.firstCall.args.slice(0, -1), [transferOperationName]);
    });

    it('should call resumeTransferOperation', function () {
      var program = getSample().program;

      sinon.stub(program, 'resumeTransferOperation');
      program.main(['operations', 'resume', transferOperationName]);
      assert.equal(program.resumeTransferOperation.calledOnce, true);
      assert.deepEqual(program.resumeTransferOperation.firstCall.args.slice(0, -1), [transferOperationName]);
    });
  });
});
