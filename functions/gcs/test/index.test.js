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

var fs = require('fs');
var path = require('path');
var proxyquire = require('proxyquire').noCallThru();

function getSample () {
  var file = {
    createReadStream: function () {
      var filepath = path.join(__dirname, '../sample.txt');
      return fs.createReadStream(filepath, { encoding: 'utf8' });
    }
  };
  var bucket = {
    file: sinon.stub().returns(file)
  };
  var storage = {
    bucket: sinon.stub().returns(bucket)
  };
  var StorageMock = sinon.stub().returns(storage);
  return {
    sample: proxyquire('../', {
      '@google-cloud/storage': StorageMock
    }),
    mocks: {
      Storage: StorageMock,
      storage: storage,
      bucket: bucket,
      file: file
    }
  };
}

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

describe('functions:gcs', function () {
  it('Fails without a bucket', function () {
    var expectedMsg = 'Bucket not provided. Make sure you have a "bucket" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.wordCount(context, {
      file: 'file'
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('Fails without a file', function () {
    var expectedMsg = 'Filename not provided. Make sure you have a "file" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.wordCount(context, {
      bucket: 'bucket'
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('Reads the file line by line', function (done) {
    var expectedMsg = 'The file sample.txt has 114 words';
    var data = {
      bucket: 'bucket',
      file: 'sample.txt'
    };
    var context = {
      success: function (message) {
        assert.equal(message, expectedMsg);
        done();
      },
      failure: function () {
        done('Should have succeeded!');
      }
    };

    var gcsSample = getSample();
    gcsSample.sample.wordCount(context, data);

    assert.equal(gcsSample.mocks.storage.bucket.calledOnce, true);
    assert.equal(gcsSample.mocks.storage.bucket.firstCall.args[0], data.bucket);
    assert.equal(gcsSample.mocks.bucket.file.calledOnce, true);
    assert.equal(gcsSample.mocks.bucket.file.firstCall.args[0], data.file);
  });
});
