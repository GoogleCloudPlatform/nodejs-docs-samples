/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how to perform basic operations on buckets with
 * the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

'use strict';

// [START all]
const Storage = require('@google-cloud/storage');

// [START storage_create_bucket]
function createBucket (bucketName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // Creates a new bucket, e.g. "my-new-bucket"
  storageClient.createBucket(bucketName, (err, bucket) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Bucket ${bucket.name} created.`);
    callback();
  });
}
// [END storage_create_bucket]

// [START storage_list_buckets]
function listBuckets (callback) {
  // Instantiates a client
  const storageClient = Storage();

  // Lists all buckets in the current project
  storageClient.getBuckets((err, buckets) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Buckets:');
    buckets.forEach((bucket) => console.log(bucket.name));
    callback();
  });
}
// [END storage_list_buckets]

// [START storage_delete_bucket]
function deleteBucket (bucketName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Deletes the bucket
  bucket.delete((err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Bucket ${bucket.name} deleted.`);
    callback();
  });
}
// [END storage_delete_bucket]
// [END all]

// The command-line program
const cli = require(`yargs`);
const noop = require(`../utils`).noop;

const program = module.exports = {
  createBucket: createBucket,
  listBuckets: listBuckets,
  deleteBucket: deleteBucket,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`create <bucket>`, `Creates a new bucket.`, {}, (options) => {
    program.createBucket(options.bucket, noop);
  })
  .command(`list`, `Lists all buckets in the current project.`, {}, () => {
    program.listBuckets(noop);
  })
  .command(`delete <bucket>`, `Deletes a bucket.`, {}, (options) => {
    program.deleteBucket(options.bucket, noop);
  })
  .example(`node $0 create my-bucket`, `Creates a new bucket named "my-bucket".`)
  .example(`node $0 list`, `Lists all buckets in the current project.`)
  .example(`node $0 delete my-bucket`, `Deletes a bucket named "my-bucket".`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/storage/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
