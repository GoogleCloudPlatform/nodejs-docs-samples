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
var fileName = 'file.txt';
var entity = 'user-bob@domain.com';
var role = 'OWNER';

function getSample () {
  var aclObjectMock = {};
  var fileMock = {
    acl: {
      add: sinon.stub().yields(null, aclObjectMock),
      get: sinon.stub().yields(null, aclObjectMock),
      delete: sinon.stub().yields(null, aclObjectMock)
    },
    name: fileName
  };
  var bucketMock = {
    acl: {
      add: sinon.stub().yields(null, aclObjectMock),
      get: sinon.stub().yields(null, aclObjectMock),
      delete: sinon.stub().yields(null, aclObjectMock),
      default: {
        add: sinon.stub().yields(null, aclObjectMock),
        get: sinon.stub().yields(null, aclObjectMock),
        delete: sinon.stub().yields(null, aclObjectMock)
      }
    },
    file: sinon.stub().returns(fileMock),
    name: bucketName
  };
  var storageMock = {
    bucket: sinon.stub().returns(bucketMock)
  };
  var StorageMock = sinon.stub().returns(storageMock);

  return {
    program: proxyquire('../acl', {
      '@google-cloud/storage': StorageMock,
      yargs: proxyquire('yargs', {})
    }),
    mocks: {
      Storage: StorageMock,
      storage: storageMock,
      bucket: bucketMock,
      file: fileMock,
      aclObject: aclObjectMock
    }
  };
}

describe('storage:acl', function () {
  describe('addAccessControl', function () {
    it('should add access controls to bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        entity: entity,
        role: role
      };

      sample.program.addAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.add.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.add.firstCall.args.slice(0, -1), [{
        entity: entity,
        role: role
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Added access controls to: gs://%s', bucketName, '']);
    });

    it('should add "default" access controls to bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        entity: entity,
        role: role,
        default: true
      };

      sample.program.addAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.default.add.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.default.add.firstCall.args.slice(0, -1), [{
        entity: entity,
        role: role
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Added access controls to: gs://%s', bucketName, '']);
    });

    it('should add access controls to a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        entity: entity,
        role: role,
        file: fileName
      };

      sample.program.addAccessControl(options, callback);

      assert.equal(sample.mocks.file.acl.add.calledOnce, true);
      assert.deepEqual(sample.mocks.file.acl.add.firstCall.args.slice(0, -1), [{
        entity: entity,
        role: role
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Added access controls to: gs://%s/%s', bucketName, fileName]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bucket.acl.add.yields(error);

      sample.program.addAccessControl({
        bucket: bucketName,
        entity: entity,
        role: role
      }, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('getAccessControl', function () {
    it('should get all access controls for a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName
      };

      sample.program.getAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.get.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.get.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Got access controls for: gs://%s', bucketName, '']);
    });

    it('should get all "default" access controls for a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        default: true
      };

      sample.program.getAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.default.get.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.default.get.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Got access controls for: gs://%s', bucketName, '']);
    });

    it('should get an entity\'s access controls for a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        entity: entity
      };
      sample.mocks.bucket.acl.get.yields(null, sample.mocks.aclObject);

      sample.program.getAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.get.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.get.firstCall.args.slice(0, -1), [{
        entity: entity
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Got access controls for: gs://%s', bucketName, '']);
    });

    it('should get an entity\'s "default" access controls for a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        entity: entity,
        default: true
      };
      sample.mocks.bucket.acl.default.get.yields(null, sample.mocks.aclObject);

      sample.program.getAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.default.get.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.default.get.firstCall.args.slice(0, -1), [{
        entity: entity
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Got access controls for: gs://%s', bucketName, '']);
    });

    it('should get access controls for a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: fileName
      };

      sample.program.getAccessControl(options, callback);

      assert.equal(sample.mocks.file.acl.get.calledOnce, true);
      assert.deepEqual(sample.mocks.file.acl.get.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.aclObject]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Got access controls for: gs://%s/%s', bucketName, fileName]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName
      };
      sample.mocks.bucket.acl.get.yields(error);

      sample.program.getAccessControl(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('deleteAccessControl', function () {
    it('should delete an entity\'s access controls from a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        entity: entity
      };
      sample.mocks.bucket.acl.delete.yields(null, sample.mocks.aclObject);

      sample.program.deleteAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.delete.firstCall.args.slice(0, -1), [{
        entity: entity
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted access controls from: gs://%s', bucketName, '']);
    });

    it('should delete an entity\'s "default" access controls from a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        entity: entity,
        default: true
      };
      sample.mocks.bucket.acl.default.delete.yields(null, sample.mocks.aclObject);

      sample.program.deleteAccessControl(options, callback);

      assert.equal(sample.mocks.bucket.acl.default.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.acl.default.delete.firstCall.args.slice(0, -1), [{
        entity: entity
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted access controls from: gs://%s', bucketName, '']);
    });

    it('should delete access controls from a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: fileName,
        entity: entity
      };

      sample.program.deleteAccessControl(options, callback);

      assert.equal(sample.mocks.file.acl.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.file.acl.delete.firstCall.args.slice(0, -1), [{
        entity: entity
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted access controls from: gs://%s/%s', bucketName, fileName]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName
      };
      sample.mocks.bucket.acl.delete.yields(error);

      sample.program.deleteAccessControl(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('main', function () {
    it('should call addAccessControl', function () {
      var program = getSample().program;

      sinon.stub(program, 'addAccessControl');
      program.main(['add', entity, role, '-b', bucketName]);
      assert.equal(program.addAccessControl.calledOnce, true);
      assert.deepEqual(program.addAccessControl.firstCall.args.slice(0, -1), [{
        entity: entity,
        role: role,
        bucket: bucketName,
        default: false,
        file: undefined
      }]);
    });

    it('should call getAccessControl', function () {
      var program = getSample().program;

      sinon.stub(program, 'getAccessControl');
      program.main(['get', entity, '-b', bucketName]);
      assert.equal(program.getAccessControl.calledOnce, true);
      assert.deepEqual(program.getAccessControl.firstCall.args.slice(0, -1), [{
        entity: entity,
        bucket: bucketName,
        default: false,
        file: undefined
      }]);
    });

    it('should call deleteAccessControl', function () {
      var program = getSample().program;

      sinon.stub(program, 'deleteAccessControl');
      program.main(['delete', entity, '-b', bucketName]);
      assert.equal(program.deleteAccessControl.calledOnce, true);
      assert.deepEqual(program.deleteAccessControl.firstCall.args.slice(0, -1), [{
        entity: entity,
        bucket: bucketName,
        default: false,
        file: undefined
      }]);
    });
  });
});
