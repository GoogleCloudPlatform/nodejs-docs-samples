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
var test = require('ava');
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();

function getSample () {
  var file = {
    createReadStream: function () {
      var filepath = path.join(__dirname, '../../functions/gcs/sample.txt');
      return fs.createReadStream(filepath, { encoding: 'utf8' });
    }
  };
  var bucket = {
    file: sinon.stub().returns(file)
  };
  var storage = {
    bucket: sinon.stub().returns(bucket)
  };
  var gcloud = {
    storage: sinon.stub().returns(storage)
  };
  return {
    sample: proxyquire('../../functions/gcs', {
      gcloud: gcloud
    }),
    mocks: {
      gcloud: gcloud,
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

test('Fails without a bucket', function (t) {
  var expectedMsg = 'Bucket not provided. Make sure you have a "bucket" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.wordCount(context, {
    file: 'file'
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('Fails without a file', function (t) {
  var expectedMsg = 'Filename not provided. Make sure you have a "file" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.wordCount(context, {
    bucket: 'bucket'
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test.cb('Reads the file line by line', function (t) {
  var expectedMsg = 'The file sample.txt has 114 words';
  var data = {
    bucket: 'bucket',
    file: 'sample.txt'
  };
  var context = {
    success: function (message) {
      t.is(message, expectedMsg);
      t.end();
    },
    failure: function () {
      t.end('Should have succeeded!');
    }
  };

  var gcsSample = getSample();
  gcsSample.sample.wordCount(context, data);

  t.is(gcsSample.mocks.storage.bucket.calledOnce, true);
  t.is(gcsSample.mocks.storage.bucket.firstCall.args[0], data.bucket);
  t.is(gcsSample.mocks.bucket.file.calledOnce, true);
  t.is(gcsSample.mocks.bucket.file.firstCall.args[0], data.file);
});
