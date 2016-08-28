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

var uuid = require('node-uuid');
var path = require('path');
var storage = require('@google-cloud/storage')();
var program = require('../analyze');

var bucketName = 'nodejs-docs-samples-test-' + uuid.v4();
var fileName = 'text.txt';
var localFilePath = path.join(__dirname, '../resources/text.txt');
var text = 'President Obama is speaking at the White House.';
var options = {
  type: 'text'
};

describe('language:analyze', function () {
  before(function (done) {
    storage.createBucket(bucketName, function (err, bucket) {
      assert.equal(err, null);
      bucket.upload(localFilePath, done);
    });
  });

  after(function (done) {
    storage.bucket(bucketName).deleteFiles({ force: true }, function (err) {
      assert.equal(err, null);
      storage.bucket(bucketName).delete(done);
    });
  });

  describe('analyzeSentimentFromString', function () {
    it('should analyze sentiment in text', function (done) {
      program.analyzeSentimentFromString(text, options, function (err, sentiment) {
        assert.equal(err, null);
        assert.equal(typeof sentiment, 'object');
        assert.equal(typeof sentiment.polarity, 'number');
        assert.equal(typeof sentiment.magnitude, 'number');
        done();
      });
    });
  });

  describe('analyzeSentimentFromFile', function () {
    it('should analyze sentiment in a file', function (done) {
      program.analyzeSentimentFromFile(bucketName, fileName, options, function (err, sentiment) {
        assert.equal(err, null);
        assert.equal(typeof sentiment, 'object');
        assert.equal(typeof sentiment.polarity, 'number');
        assert.equal(typeof sentiment.magnitude, 'number');
        done();
      });
    });
  });

  describe('analyzeEntitiesFromString', function () {
    it('should analyze entities in text', function (done) {
      program.analyzeEntitiesFromString(text, options, function (err, entities) {
        assert.equal(err, null);
        assert.equal(typeof entities, 'object');
        assert.equal(Array.isArray(entities.people), true);
        assert.equal(Array.isArray(entities.places), true);
        done();
      });
    });
  });

  describe('analyzeEntitiesFromFile', function () {
    it('should analyze entities in a file', function (done) {
      program.analyzeEntitiesFromFile(bucketName, fileName, options, function (err, entities) {
        assert.equal(err, null);
        assert.equal(typeof entities, 'object');
        assert.equal(Array.isArray(entities.people), true);
        assert.equal(Array.isArray(entities.places), true);
        done();
      });
    });
  });

  describe('analyzeSyntaxFromString', function () {
    it('should analyze syntax in text', function (done) {
      program.analyzeSyntaxFromString(text, options, function (err, syntax) {
        assert.equal(err, null);
        assert.equal(typeof syntax, 'object');
        assert.equal(Array.isArray(syntax.sentences), true);
        assert.equal(Array.isArray(syntax.tokens), true);
        done();
      });
    });
  });

  describe('analyzeSyntaxFromFile', function () {
    it('should analyze syntax in a file', function (done) {
      program.analyzeSyntaxFromFile(bucketName, fileName, options, function (err, syntax) {
        assert.equal(err, null);
        assert.equal(typeof syntax, 'object');
        assert.equal(Array.isArray(syntax.sentences), true);
        assert.equal(Array.isArray(syntax.tokens), true);
        done();
      });
    });
  });
});
