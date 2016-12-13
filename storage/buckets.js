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

const Storage = require('@google-cloud/storage');

// [START storage_create_bucket]
function createBucket (bucketName) {
  // Instantiates a client
  const storage = Storage();

  // Creates a new bucket, e.g. "my-new-bucket"
  return storage.createBucket(bucketName)
    .then((results) => {
      const bucket = results[0];

      console.log(`Bucket ${bucket.name} created.`);

      return bucket;
    });
}
// [END storage_create_bucket]

// [START storage_list_buckets]
function listBuckets () {
  // Instantiates a client
  const storage = Storage();

  // Lists all buckets in the current project
  return storage.getBuckets()
    .then((results) => {
      const buckets = results[0];

      console.log('Buckets:');
      buckets.forEach((bucket) => console.log(bucket.name));

      return buckets;
    });
}
// [END storage_list_buckets]

// [START storage_delete_bucket]
function deleteBucket (bucketName) {
  // Instantiates a client
  const storage = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);

  // Deletes the bucket
  return bucket.delete()
    .then(() => {
      console.log(`Bucket ${bucket.name} deleted.`);
    });
}
// [END storage_delete_bucket]

require(`yargs`)
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
  .strict()
  .argv;
