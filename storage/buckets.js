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
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Storage = require('@google-cloud/storage');

// Instantiate a storage client
var storage = Storage();
// [END setup]

// [START create_bucket]
/**
 * Creates a new bucket with the given name.
 *
 * @param {string} name The name of the new bucket.
 * @param {function} cb The callback function.
 */
function createBucket (name, callback) {
  var bucket = storage.bucket(name);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/bucket
  bucket.create(function (err, bucket) {
    if (err) {
      return callback(err);
    }

    console.log('Created bucket: %s', name);
    return callback(null, bucket);
  });
}
// [END create_bucket]

// [START list_buckets]
/**
 * List all of the authenticated project's buckets.
 *
 * @param {function} cb The callback function.
 */
function listBuckets (callback) {
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage
  storage.getBuckets(function (err, buckets) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d bucket(s)!', buckets.length);
    return callback(null, buckets);
  });
}
// [END list_buckets]

// [START delete_bucket]
/**
 * Deletes the specified bucket.
 *
 * @param {string} name The name of the bucket to delete.
 * @param {function} cb The callback function.
 */
function deleteBucket (name, callback) {
  var bucket = storage.bucket(name);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/bucket
  bucket.delete(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted bucket: %s', name);
    return callback(null);
  });
}
// [END delete_bucket]
// [END all]

// The command-line program
var cli = require('yargs');

var program = module.exports = {
  createBucket: createBucket,
  listBuckets: listBuckets,
  deleteBucket: deleteBucket,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('create <bucket>', 'Create a new bucket with the given name.', {}, function (options) {
    program.createBucket(options.bucket, console.log);
  })
  .command('list', 'List all buckets in the authenticated project.', {}, function () {
    program.listBuckets(console.log);
  })
  .command('delete <bucket>', 'Delete the specified bucket.', {}, function (options) {
    program.deleteBucket(options.bucket, console.log);
  })
  .example('node $0 create my-bucket', 'Create a new bucket named "my-bucket".')
  .example('node $0 list', 'List all buckets in the authenticated project.')
  .example('node $0 delete my-bucket', 'Delete "my-bucket".')
  .wrap(80)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/storage/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
