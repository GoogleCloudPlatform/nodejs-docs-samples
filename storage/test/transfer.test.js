// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var proxyquire = require('proxyquire').noCallThru();
var bucketName = 'foo';
var jobName = 'transferJobs/123456789012345678';
var transferOperationName = 'transferOperations/123456789012345678';

function getSample () {
  var transferJobMock = {};
  var transferOperationMock = {};
  var storagetransferMock = {
    transferJobs: {
      create: sinon.stub().callsArgWith(1, null, transferJobMock),
      get: sinon.stub().callsArgWith(1, null, transferJobMock),
      patch: sinon.stub().callsArgWith(1, null, transferJobMock),
      list: sinon.stub().callsArgWith(1, null, { transferJobs: [transferJobMock] })
    },
    transferOperations: {
      get: sinon.stub().callsArgWith(1, null, transferOperationMock),
      pause: sinon.stub().callsArgWith(1, null, transferOperationMock),
      resume: sinon.stub().callsArgWith(1, null, transferOperationMock),
      list: sinon.stub().callsArgWith(1, null, { operations: [transferOperationMock] })
    }
  };
  var googleapisMock = {
    storagetransfer: sinon.stub().returns(storagetransferMock),
    auth: {
      getApplicationDefault: sinon.stub().callsArgWith(0, null, {})
    }
  };
  return {
    program: proxyquire('../transfer', {
      googleapis: googleapisMock
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

        sample.program.createTransferJob(bucketName, bucketName, '2016/08/11', '15:30', null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.firstCall.args[1], sample.mocks.transferJob, 'callback received transfer job');

        sample.program.createTransferJob(bucketName, bucketName, '2016/08/11', '15:30', description, callback);

        assert(callback.calledTwice, 'callback called twice');
        assert.equal(callback.secondCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.secondCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.secondCall.args[1], sample.mocks.transferJob, 'callback received transfer job');
        assert.equal(sample.mocks.storagetransfer.transferJobs.create.secondCall.args[0].resource.description, description, 'description was set');
      });

      it('should require "srcBucketName"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.createTransferJob(null, null, null, null, null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"srcBucketName" is required!', 'error has correct message');
      });

      it('should require "destBucketName"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.createTransferJob(bucketName, null, null, null, null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"destBucketName" is required!', 'error has correct message');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.createTransferJob(bucketName, bucketName, 'time', 'date', null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle create error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferJobs.create.callsArgWith(1, error);

        sample.program.createTransferJob(bucketName, bucketName, 'time', 'date', null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });

    describe('get', function () {
      it('should get a transfer job', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.getTransferJob(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.firstCall.args[1], sample.mocks.transferJob, 'callback received transfer job');
      });

      it('should require "jobName"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.getTransferJob(null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"jobName" is required!', 'error has correct message');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.getTransferJob(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle get error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferJobs.get.callsArgWith(1, error);

        sample.program.getTransferJob(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });

    describe('set', function () {
      it('should update a transfer job', function () {
        var field = 'status';
        var value = 'DISABLED';
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.updateTransferJob(jobName, field, value, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.firstCall.args[1], sample.mocks.transferJob, 'callback received transfer job');

        field = 'description';
        value = 'description';

        sample.program.updateTransferJob(jobName, field, value, callback);

        assert(callback.calledTwice, 'callback called twice');
        assert.equal(callback.secondCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.secondCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.secondCall.args[1], sample.mocks.transferJob, 'callback received transfer job');

        field = 'transferSpec';
        value = '{"foo":"bar"}';

        sample.program.updateTransferJob(jobName, field, value, callback);

        assert(callback.calledThrice, 'callback called thrice');
        assert.equal(callback.thirdCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.thirdCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.thirdCall.args[1], sample.mocks.transferJob, 'callback received transfer job');
      });

      it('should require "jobName"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.updateTransferJob(null, null, null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"jobName" is required!', 'error has correct message');
      });

      it('should require "field"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.updateTransferJob(jobName, null, null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"field" is required!', 'error has correct message');
      });

      it('should require "value"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.updateTransferJob(jobName, 'field', null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"value" is required!', 'error has correct message');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.updateTransferJob(jobName, 'field', 'value', callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle patch error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferJobs.patch.callsArgWith(1, error);

        sample.program.updateTransferJob(jobName, 'field', 'value', callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });

    describe('list', function () {
      it('should list transfer jobs', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.listTransferJobs(callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.deepEqual(callback.firstCall.args[1], [sample.mocks.transferJob], 'callback received transfer jobs');

        sample.mocks.storagetransfer.transferJobs.list.callsArgWith(1, null, {});
        sample.program.listTransferJobs(callback);

        assert(callback.calledTwice, 'callback called twice');
        assert.equal(callback.secondCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.secondCall.args[0], 'callback did not receive error');
        assert.deepEqual(callback.secondCall.args[1], [], 'callback received no transfer jobs');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.listTransferJobs(callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle list error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferJobs.list.callsArgWith(1, error);

        sample.program.listTransferJobs(callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });
  });

  describe('operations', function () {
    describe('list', function () {
      it('should list transfer operations', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.listTransferOperations(undefined, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.deepEqual(callback.firstCall.args[1], [sample.mocks.transferOperation], 'callback received transfer operations');

        sample.program.listTransferOperations(jobName, callback);

        assert(callback.calledTwice, 'callback called twice');
        assert.equal(callback.secondCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.secondCall.args[0], 'callback did not receive error');
        assert.deepEqual(callback.secondCall.args[1], [sample.mocks.transferOperation], 'callback received transfer operations');

        sample.mocks.storagetransfer.transferOperations.list.callsArgWith(1, null, {});
        sample.program.listTransferOperations(jobName, callback);

        assert(callback.calledThrice, 'callback called thrice');
        assert.equal(callback.thirdCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.thirdCall.args[0], 'callback did not receive error');
        assert.deepEqual(callback.thirdCall.args[1], [], 'callback received no transfer operations');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.listTransferOperations(undefined, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle list error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.list.callsArgWith(1, error);

        sample.program.listTransferOperations(undefined, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });

    describe('get', function () {
      it('should get a transfer operation', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.getTransferOperation(transferOperationName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.firstCall.args[1], sample.mocks.transferOperation, 'callback received transfer operation');
      });

      it('should require "transferOperationName"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.getTransferOperation(null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"transferOperationName" is required!', 'error has correct message');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.getTransferOperation(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle get error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.get.callsArgWith(1, error);

        sample.program.getTransferOperation(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });

    describe('pause', function () {
      it('should pause a transfer operation', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.pauseTransferOperation(transferOperationName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      });

      it('should require "transferOperationName"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.pauseTransferOperation(null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"transferOperationName" is required!', 'error has correct message');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.pauseTransferOperation(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle pause error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.pause.callsArgWith(1, error);

        sample.program.pauseTransferOperation(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });

    describe('resume', function () {
      it('should resume a transfer operation', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.resumeTransferOperation(transferOperationName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      });

      it('should require "transferOperationName"', function () {
        var sample = getSample();
        var callback = sinon.stub();

        sample.program.resumeTransferOperation(null, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, '"transferOperationName" is required!', 'error has correct message');
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.resumeTransferOperation(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle resume error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.storagetransfer.transferOperations.resume.callsArgWith(1, error);

        sample.program.resumeTransferOperation(jobName, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });
    });
  });

  describe('printUsage', function () {
    it('should print usage', function () {
      var program = getSample().program;

      program.printUsage();

      assert(console.log.calledWith('Usage: node encryption RESOURCE COMMAND [ARGS...]'));
      assert(console.log.calledWith('\nResources:\n'));
      assert(console.log.calledWith('    jobs'));
      assert(console.log.calledWith('\n\tCommands:\n'));
      assert(console.log.calledWith('\t\tcreate SRC_BUCKET_NAME DEST_BUCKET_NAME DATE TIME [DESCRIPTION]'));
      assert(console.log.calledWith('\t\tget JOB_NAME'));
      assert(console.log.calledWith('\t\tlist'));
      assert(console.log.calledWith('\t\tset JOB_NAME FIELD VALUE'));
      assert(console.log.calledWith('\n    operations'));
      assert(console.log.calledWith('\n\tCommands:\n'));
      assert(console.log.calledWith('\t\tlist [JOB_NAME]'));
      assert(console.log.calledWith('\t\tget TRANSFER_NAME'));
      assert(console.log.calledWith('\t\tpause TRANSFER_NAME'));
      assert(console.log.calledWith('\t\tresume TRANSFER_NAME'));
      assert(console.log.calledWith('\nExamples:\n'));
      assert(console.log.calledWith('\tnode transfer jobs create my-bucket my-other-bucket 2016/08/12 16:30 "Move my files"'));
      assert(console.log.calledWith('\tnode transfer jobs get transferJobs/123456789012345678'));
      assert(console.log.calledWith('\tnode transfer jobs list'));
      assert(console.log.calledWith('\tnode transfer jobs set transferJobs/123456789012345678 description "My new description"'));
      assert(console.log.calledWith('\tnode transfer jobs set transferJobs/123456789012345678 status DISABLED'));
      assert(console.log.calledWith('\tnode transfer operations list'));
      assert(console.log.calledWith('\tnode transfer operations list transferJobs/123456789012345678'));
      assert(console.log.calledWith('\tnode transfer operations get transferOperations/123456789012345678'));
      assert(console.log.calledWith('\tnode transfer operations pause transferOperations/123456789012345678'));
      assert(console.log.calledWith('\tnode transfer operations resume transferOperations/123456789012345678'));
    });
  });

  describe('main', function () {
    it('should call the right commands', function () {
      var program = getSample().program;

      sinon.stub(program, 'createTransferJob');
      program.main(['jobs', 'create']);
      assert(program.createTransferJob.calledOnce);

      sinon.stub(program, 'getTransferJob');
      program.main(['jobs', 'get']);
      assert(program.getTransferJob.calledOnce);

      sinon.stub(program, 'listTransferJobs');
      program.main(['jobs', 'list']);
      assert(program.listTransferJobs.calledOnce);

      sinon.stub(program, 'updateTransferJob');
      program.main(['jobs', 'set']);
      assert(program.updateTransferJob.calledOnce);

      sinon.stub(program, 'listTransferOperations');
      program.main(['operations', 'list']);
      assert(program.listTransferOperations.calledOnce);

      sinon.stub(program, 'getTransferOperation');
      program.main(['operations', 'get']);
      assert(program.getTransferOperation.calledOnce);

      sinon.stub(program, 'pauseTransferOperation');
      program.main(['operations', 'pause']);
      assert(program.pauseTransferOperation.calledOnce);

      sinon.stub(program, 'resumeTransferOperation');
      program.main(['operations', 'resume']);
      assert(program.resumeTransferOperation.calledOnce);

      sinon.stub(program, 'printUsage');
      program.main(['--help']);
      assert(program.printUsage.calledOnce);

      program.main(['jobs']);
      assert(program.printUsage.calledTwice);

      program.main(['operations']);
      assert(program.printUsage.calledThrice);
    });
  });
});
