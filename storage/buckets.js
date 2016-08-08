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
function createBucket (name, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  }

  storage.createBucket(name, function (err, bucket) {
    if (err) {
      return callback(err);
    }

    console.log('Created bucket: %s', name);
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
function listBuckets (callback) {
  storage.getBuckets(function (err, buckets) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d buckets!', buckets.length);
    return callback(null, buckets);
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
function deleteBucket (name, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  }

  var bucket = storage.bucket(name);

  bucket.delete(function (err, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted bucket: %s', name);
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

// The command-line program
var program = {
  createBucket: createBucket,
  listBuckets: listBuckets,
  deleteBucket: deleteBucket,
  printUsage: printUsage,

  // Executed when this program is run from the command-line
  main: function (args, cb) {
    var command = args.shift();
    if (command === 'create') {
      this.createBucket(args[0], cb);
    } else if (command === 'list') {
      this.listBuckets(cb);
    } else if (command === 'delete') {
      this.deleteBucket(args[0], cb);
    } else {
      this.printUsage();
    }
  }
};

if (module === require.main) {
  program.main(process.argv.slice(2), console.log);
}
// [END all]

module.exports = program;
