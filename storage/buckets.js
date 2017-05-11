/**
 * Copyright 2017, Google, Inc.
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

function createBucket (bucketName) {
  // [START storage_create_bucket]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to create, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // Instantiates a client
  const storage = Storage();

  // Creates a new bucket
  storage
    .createBucket(bucketName)
    .then(() => {
      console.log(`Bucket ${bucketName} created.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_create_bucket]
}

function listBuckets () {
  // [START storage_list_buckets]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // Instantiates a client
  const storage = Storage();

  // Lists all buckets in the current project
  storage
    .getBuckets()
    .then((results) => {
      const buckets = results[0];

      console.log('Buckets:');
      buckets.forEach((bucket) => {
        console.log(bucket.name);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_list_buckets]
}

function deleteBucket (bucketName) {
  // [START storage_delete_bucket]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to delete, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // Instantiates a client
  const storage = Storage();

  // Deletes the bucket
  storage
    .bucket(bucketName)
    .delete()
    .then(() => {
      console.log(`Bucket ${bucketName} deleted.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_delete_bucket]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `create <bucket>`,
    `Creates a new bucket.`,
    {},
    (opts) => createBucket(opts.bucket)
  )
  .command(
    `list`,
    `Lists all buckets in the current project.`,
    {},
    listBuckets
  )
  .command(
    `delete <bucket>`,
    `Deletes a bucket.`,
    {},
    (opts) => deleteBucket(opts.bucket)
  )
  .example(`node $0 create my-bucket`, `Creates a new bucket named "my-bucket".`)
  .example(`node $0 list`, `Lists all buckets in the current project.`)
  .example(`node $0 delete my-bucket`, `Deletes a bucket named "my-bucket".`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/storage/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
