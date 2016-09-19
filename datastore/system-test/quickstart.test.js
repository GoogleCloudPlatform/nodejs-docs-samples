// Copyright 2015-2016, Google, Inc.
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

var proxyquire = require('proxyquire').noPreserveCache();
var datastore = proxyquire('@google-cloud/datastore', {})();
var kind = 'Task';
var message = 'Buy milk';
var key = datastore.key(kind);

describe('datastore:quickstart', function () {
  var datastoreMock, DatastoreMock;

  before(function (done) {
    datastore.save({
      key: key,
      data: {
        message: message
      }
    }, function () {
      // Datastore is eventually consistent
      setTimeout(done, 5000);
    });
  });

  after(function (done) {
    datastore.delete(key, function () {
      // Ignore any error, the Datastore might not have been created
      done();
    });
  });

  it('should get a task from Datastore', function (done) {
    datastoreMock = {
      key: function () {
        return key;
      },

      get: function (_key) {
        assert.equal(_key, key);

        datastore.get(_key, function (err, entity) {
          assert.ifError(err);
          assert.notEqual(entity, undefined);
          assert.notEqual(entity.key, undefined);
          assert.equal(entity.key.kind, kind);
          assert.deepEqual(entity.data, { message: message });
          done();
        });
      }
    };
    DatastoreMock = sinon.stub().returns(datastoreMock);

    proxyquire('../quickstart', {
      '@google-cloud/datastore': DatastoreMock
    });
  });
});
