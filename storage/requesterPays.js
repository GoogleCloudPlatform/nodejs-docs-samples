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

function enableRequesterPays (bucketName) {
  // [START enable_requester_pays]
  // Imports the Google Cloud client library
  const Storage = require(`@google-cloud/storage`);

  // The name of the bucket to enable requester-paying for, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // Instantiates a client
  const storage = Storage();

  // Enables requester-pays requests
  storage
    .bucket(bucketName)
    .enableRequesterPays()
    .then(() => {
      console.log(`Requester-pays requests have been enabled for bucket ${bucketName}.`);
    })
    .catch((err) => {
      console.error(`ERROR:`, err);
    });
  // [END enable_requester_pays]
}

function disableRequesterPays (bucketName) {
  // [START disable_requester_pays]
  // Imports the Google Cloud client library
  const Storage = require(`@google-cloud/storage`);

  // The name of the bucket to disable requester-paying for, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // Instantiates a client
  const storage = Storage();

  // Disables requester-pays requests
  storage
    .bucket(bucketName)
    .disableRequesterPays()
    .then(() => {
      console.log(`Requester-pays requests have been disabled for bucket ${bucketName}.`);
    })
    .catch((err) => {
      console.error(`ERROR:`, err);
    });
  // [END disable_requester_pays]
}

function getRequesterPaysStatus (bucketName) {
  // [START get_requester_pays_status]
  // Imports the Google Cloud client library
  const Storage = require(`@google-cloud/storage`);

  // The name of the bucket to get the requester-payable status for, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // Instantiates a client
  const storage = Storage();

  // Gets the requester-pays status of a bucket
  storage
    .bucket(bucketName)
    .getMetadata()
    .then((data) => {
      let status;
      const metadata = data[0];
      if (metadata && metadata.billing && metadata.billing.requesterPays) {
        status = `enabled`;
      } else {
        status = `disabled`;
      }
      console.log(`Requester-pays requests are ${status} for bucket ${bucketName}.`);
    })
    .catch((err) => {
      console.error(`ERROR:`, err);
    });
  // [END get_requester_pays_status]
}

function downloadFileUsingRequesterPays (projectId, bucketName, srcFilename, destFilename) {
  // [START storage_download_file_requester_pays]
  // Imports the Google Cloud client library
  const Storage = require(`@google-cloud/storage`);

  // The project ID to bill from
  // const projectId = process.env.GCLOUD_PROJECT;

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the remote file to download, e.g. "file.txt"
  // const srcFilename = "file.txt";

  // The path to which the file should be downloaded, e.g. "./local/path/to/file.txt"
  // const destFilename = "./local/path/to/file.txt";

  // Instantiates a client
  const storage = Storage();

  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,

    // The project to bill from, if requester-pays requests are enabled
    userProject: projectId
  };

  // Downloads the file
  storage
    .bucket(bucketName)
    .file(srcFilename)
    .download(options)
    .then(() => {
      console.log(`gs://${bucketName}/${srcFilename} downloaded to ${destFilename} using requester-pays requests.`);
    })
    .catch((err) => {
      console.error(`ERROR:`, err);
    });
  // [END storage_download_file_requester_pays]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `enable <bucket>`,
    `Enables requester-pays requests on a bucket.`,
    {},
    (opts) => enableRequesterPays(opts.bucket)
  )
  .command(
    `disable <bucket>`,
    `Disables requester-pays requests on a bucket.`,
    {},
    (opts) => disableRequesterPays(opts.bucket)
  )
  .command(
    `get-status <bucket>`,
    `Determines whether requester-pays requests are enabled on a bucket.`,
    {},
    (opts) => getRequesterPaysStatus(opts.bucket)
  )
  .command(
    `download <bucketName> <srcFileName> <destFileName>`,
    `Downloads a file from a bucket using requester-pays requests.`,
  {
    projectId: {
      type: `string`,
      alias: `p`,
      default: process.env.GCLOUD_PROJECT
    }
  },
    (opts) => downloadFileUsingRequesterPays(opts.projectId, opts.bucketName, opts.srcFileName, opts.destFileName)
  )
  .example(`node $0 enable my-bucket`, `Enables requester-pays requests on a bucket named "my-bucket".`)
  .example(`node $0 disable my-bucket`, `Disables requester-pays requests on a bucket named "my-bucket".`)
  .example(`node $0 get-status my-bucket`, `Determines whether requester-pays requests are enabled for a bucket named "my-bucket".`)
  .example(`node $0 download my-bucket file.txt ./file.txt`, `Downloads "gs://my-bucket/file.txt" to "./file.txt" using requester-pays requests.`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/storage/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
