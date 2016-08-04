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

// [START all]
// [START setup]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var gcloud = require('gcloud');

// Get a reference to the storage component
var storage = gcloud.storage();
// [END setup]

// [START create]
/**
 * Creates a new bucket with the given name.
 *
 * @param {string} name The name of the new bucket.
 * @param {function} cb The callback function.
 */
function createBucketExample (name, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  }

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage?method=createBucket
  storage.createBucket(name, function (err, bucket, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Created bucket: ' + name);
    return callback(null, bucket);
  });
}
// [END create]

// [START list]
/**
 * Fetches all of the current project's buckets.
 *
 * @param {function} cb The callback function.
 */
function listBucketsExample (callback) {
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage?method=getBuckets
  storage.getBuckets(function (err, buckets, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Found ' + buckets.length + ' buckets!');
    return callback(null, buckets, apiResponse);
  });
}
// [END list]

// [START delete]
/**
 * Deletes the specified bucket.
 *
 * @param {string} name The name of the bucket to delete.
 * @param {function} cb The callback function.
 */
function deleteBucketExample (name, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  }

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage?method=bucket
  var bucket = storage.bucket(name);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/bucket?method=delete
  bucket.delete(function (err, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted bucket: ' + name);
    return callback(null, apiResponse);
  });
}
// [END delete]

// [START usage]
function printUsage () {
  console.log('Usage: node buckets [COMMAND] [ARGS...]');
  console.log('\nCommands:\n');
  console.log('\tcreate [BUCKET_NAME]');
  console.log('\tlist');
  console.log('\tdelete [BUCKET_NAME]');
}
// [END usage]

// Run the command-line program
function main (args, cb) {
  var command = args.shift();
  if (command === 'create') {
    createBucketExample(args[0], cb);
  } else if (command === 'list') {
    listBucketsExample(cb);
  } else if (command === 'delete') {
    deleteBucketExample(args[0], cb);
  } else {
    printUsage();
    cb();
  }
}

if (module === require.main) {
  main(process.argv.slice(2), console.log);
}
// [END all]

exports.createBucketExample = createBucketExample;
exports.listBucketsExample = listBucketsExample;
exports.deleteBucketExample = deleteBucketExample;
exports.printUsage = printUsage;
exports.main = main;
