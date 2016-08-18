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
  var transferJobMock = {
    name: jobName
  };
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
          srcBucket: bucketName,
          destBucket: bucketName,
          date: date,
          time: time
        };

        sample.program.createTransferJob(options, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.firstCall.args[1], sample.mocks.transferJob, 'callback received transfer job');
        assert.equal(sample.mocks.storagetransfer.transferJobs.create.firstCall.args[0].resource.description, undefined, 'description was not set');
        assert(console.log.calledWith('Created transfer job: %s', sample.mocks.transferJob.name));

        options.description = description;
        sample.program.createTransferJob(options, callback);

        assert(callback.calledTwice, 'callback called twice');
        assert.equal(callback.secondCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.secondCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.secondCall.args[1], sample.mocks.transferJob, 'callback received transfer job');
        assert.equal(sample.mocks.storagetransfer.transferJobs.create.secondCall.args[0].resource.description, description, 'description was set');
        assert(console.log.calledWith('Created transfer job: %s', sample.mocks.transferJob.name));
      });

      it('should handle auth error', function () {
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.createTransferJob({}, callback);

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

        sample.program.createTransferJob({}, callback);

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
        assert(console.log.calledWith('Found transfer job: %s', sample.mocks.transferJob.name));
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
        var options = {
          job: jobName,
          field: field,
          value: value
        };

        sample.program.updateTransferJob(options, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.firstCall.args[1], sample.mocks.transferJob, 'callback received transfer job');

        options.field = 'description';
        options.value = 'description';

        sample.program.updateTransferJob(options, callback);

        assert(callback.calledTwice, 'callback called twice');
        assert.equal(callback.secondCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.secondCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.secondCall.args[1], sample.mocks.transferJob, 'callback received transfer job');

        options.field = 'transferSpec';
        options.value = '{"foo":"bar"}';

        sample.program.updateTransferJob(options, callback);

        assert(callback.calledThrice, 'callback called thrice');
        assert.equal(callback.thirdCall.args.length, 2, 'callback received 2 arguments');
        assert.ifError(callback.thirdCall.args[0], 'callback did not receive error');
        assert.strictEqual(callback.thirdCall.args[1], sample.mocks.transferJob, 'callback received transfer job');
        assert(console.log.calledWith('Updated transfer job: %s', sample.mocks.transferJob.name));
      });

      it('should handle auth error', function () {
        var field = 'status';
        var value = 'DISABLED';
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        var options = {
          job: jobName,
          field: field,
          value: value
        };
        sample.mocks.googleapis.auth.getApplicationDefault.callsArgWith(0, error);

        sample.program.updateTransferJob(options, callback);

        assert(callback.calledOnce, 'callback called once');
        assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
        assert(callback.firstCall.args[0], 'callback received error');
        assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
      });

      it('should handle patch error', function () {
        var field = 'status';
        var value = 'DISABLED';
        var error = new Error('error');
        var sample = getSample();
        var callback = sinon.stub();
        var options = {
          job: jobName,
          field: field,
          value: value
        };
        sample.mocks.storagetransfer.transferJobs.patch.callsArgWith(1, error);

        sample.program.updateTransferJob(options, callback);

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
        assert(console.log.calledWith('Found %d jobs!', 1));
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

  describe('main', function () {
    it('should call createTransferJob', function () {
      var program = getSample().program;

      sinon.stub(program, 'createTransferJob');
      program.main(['jobs', 'create', bucketName, bucketName, 'time', 'date']);
      assert(program.createTransferJob.calledOnce);
    });

    it('should call getTransferJob', function () {
      var program = getSample().program;

      sinon.stub(program, 'getTransferJob');
      program.main(['jobs', 'get', jobName]);
      assert(program.getTransferJob.calledOnce);
    });

    it('should call listTransferJobs', function () {
      var program = getSample().program;

      sinon.stub(program, 'listTransferJobs');
      program.main(['jobs', 'list']);
      assert(program.listTransferJobs.calledOnce);
    });

    it('should call updateTransferJob', function () {
      var program = getSample().program;

      sinon.stub(program, 'updateTransferJob');
      program.main(['jobs', 'set', jobName, 'status', 'DISABLED']);
      assert(program.updateTransferJob.calledOnce);
    });

    it('should call listTransferOperations', function () {
      var program = getSample().program;

      sinon.stub(program, 'listTransferOperations');
      program.main(['operations', 'list']);
      assert(program.listTransferOperations.calledOnce);
    });

    it('should call getTransferOperation', function () {
      var program = getSample().program;

      sinon.stub(program, 'getTransferOperation');
      program.main(['operations', 'get', transferOperationName]);
      assert(program.getTransferOperation.calledOnce);
    });

    it('should call pauseTransferOperation', function () {
      var program = getSample().program;

      sinon.stub(program, 'pauseTransferOperation');
      program.main(['operations', 'pause', transferOperationName]);
      assert(program.pauseTransferOperation.calledOnce);
    });

    it('should call resumeTransferOperation', function () {
      var program = getSample().program;

      sinon.stub(program, 'resumeTransferOperation');
      program.main(['operations', 'resume', transferOperationName]);
      assert(program.resumeTransferOperation.calledOnce);
    });
  });
});
