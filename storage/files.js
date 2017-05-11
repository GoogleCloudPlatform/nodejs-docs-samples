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
 * This application demonstrates how to perform basic operations on files with
 * the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

'use strict';

function listFiles (bucketName) {
  // [START storage_list_files]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // Instantiates a client
  const storage = Storage();

  // Lists files in the bucket
  storage
    .bucket(bucketName)
    .getFiles()
    .then((results) => {
      const files = results[0];

      console.log('Files:');
      files.forEach((file) => {
        console.log(file.name);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_list_files]
}

function listFilesByPrefix (bucketName, prefix, delimiter) {
  // [START storage_list_files_with_prefix]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The prefix by which to filter files, e.g. "public/"
  // const prefix = "public/";

  // The delimiter to use, e.g. "/"
  // const delimiter = "/";

  // Instantiates a client
  const storage = Storage();

  /**
   * This can be used to list all blobs in a "folder", e.g. "public/".
   *
   * The delimiter argument can be used to restrict the results to only the
   * "files" in the given "folder". Without the delimiter, the entire tree under
   * the prefix is returned. For example, given these blobs:
   *
   *   /a/1.txt
   *   /a/b/2.txt
   *
   * If you just specify prefix = '/a', you'll get back:
   *
   *   /a/1.txt
   *   /a/b/2.txt
   *
   * However, if you specify prefix='/a' and delimiter='/', you'll get back:
   *
   *   /a/1.txt
   */
  const options = {
    prefix: prefix
  };

  if (delimiter) {
    options.delimiter = delimiter;
  }

  // Lists files in the bucket, filtered by a prefix
  storage
    .bucket(bucketName)
    .getFiles(options)
    .then((results) => {
      const files = results[0];

      console.log('Files:');
      files.forEach((file) => {
        console.log(file.name);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_list_files_with_prefix]
}

function uploadFile (bucketName, filename) {
  // [START storage_upload_file]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the local file to upload, e.g. "./local/path/to/file.txt"
  // const filename = "./local/path/to/file.txt";

  // Instantiates a client
  const storage = Storage();

  // Uploads a local file to the bucket
  storage
    .bucket(bucketName)
    .upload(filename)
    .then(() => {
      console.log(`${filename} uploaded to ${bucketName}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_upload_file]
}

function downloadFile (bucketName, srcFilename, destFilename) {
  // [START storage_download_file]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

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
    destination: destFilename
  };

  // Downloads the file
  storage
    .bucket(bucketName)
    .file(srcFilename)
    .download(options)
    .then(() => {
      console.log(`gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_download_file]
}

function deleteFile (bucketName, filename) {
  // [START storage_delete_file]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to delete, e.g. "file.txt"
  // const filename = "file.txt";

  // Instantiates a client
  const storage = Storage();

  // Deletes the file from the bucket
  storage
    .bucket(bucketName)
    .file(filename)
    .delete()
    .then(() => {
      console.log(`gs://${bucketName}/${filename} deleted.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_delete_file]
}

function getMetadata (bucketName, filename) {
  // [START storage_get_metadata]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to access, e.g. "file.txt"
  // const filename = "file.txt";

  // Instantiates a client
  const storage = Storage();

  // Gets the metadata for the file
  storage
    .bucket(bucketName)
    .file(filename)
    .getMetadata()
    .then((results) => {
      const metadata = results[0];

      console.log(`File: ${metadata.name}`);
      console.log(`Bucket: ${metadata.bucket}`);
      console.log(`Storage class: ${metadata.storageClass}`);
      console.log(`ID: ${metadata.id}`);
      console.log(`Size: ${metadata.size}`);
      console.log(`Updated: ${metadata.updated}`);
      console.log(`Generation: ${metadata.generation}`);
      console.log(`Metageneration: ${metadata.metageneration}`);
      console.log(`Etag: ${metadata.etag}`);
      console.log(`Owner: ${metadata.owner}`);
      console.log(`Component count: ${metadata.component_count}`);
      console.log(`Crc32c: ${metadata.crc32c}`);
      console.log(`md5Hash: ${metadata.md5Hash}`);
      console.log(`Cache-control: ${metadata.cacheControl}`);
      console.log(`Content-type: ${metadata.contentType}`);
      console.log(`Content-disposition: ${metadata.contentDisposition}`);
      console.log(`Content-encoding: ${metadata.contentEncoding}`);
      console.log(`Content-language: ${metadata.contentLanguage}`);
      console.log(`Metadata: ${metadata.metadata}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_get_metadata]
}

function makePublic (bucketName, filename) {
  // [START storage_make_public]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to make public, e.g. "file.txt"
  // const filename = "file.txt";

  // Instantiates a client
  const storage = Storage();

  // Makes the file public
  storage
    .bucket(bucketName)
    .file(filename)
    .makePublic()
    .then(() => {
      console.log(`gs://${bucketName}/${filename} is now public.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_make_public]
}

function generateSignedUrl (bucketName, filename) {
  // [START storage_generate_signed_url]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to access, e.g. "file.txt"
  // const filename = "file.txt";

  // Instantiates a client
  const storage = Storage();

  // These options will allow temporary read access to the file
  const options = {
    action: 'read',
    expires: '03-17-2025'
  };

  // Get a signed URL for the file
  storage
    .bucket(bucketName)
    .file(filename)
    .getSignedUrl(options)
    .then((results) => {
      const url = results[0];

      console.log(`The signed url for ${filename} is ${url}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_generate_signed_url]
}

function moveFile (bucketName, srcFilename, destFilename) {
  // [START storage_move_file]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to move, e.g. "file.txt"
  // const srcFilename = "file.txt";

  // The destination path for the file, e.g. "moved.txt"
  // const destFilename = "moved.txt";

  // Instantiates a client
  const storage = Storage();

  // Moves the file within the bucket
  storage
    .bucket(bucketName)
    .file(srcFilename)
    .move(destFilename)
    .then(() => {
      console.log(`gs://${bucketName}/${srcFilename} moved to gs://${bucketName}/${destFilename}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_move_file]
}

function copyFile (srcBucketName, srcFilename, destBucketName, destFilename) {
  // [START storage_copy_file]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the source bucket, e.g. "my-bucket"
  // const srcBucketName = "my-bucket";

  // The name of the source file, e.g. "file.txt"
  // const srcFilename = "file.txt";

  // The destination bucket, e.g. "my-other-bucket"
  // const destBucketName = "my-other-bucket";

  // The destination filename, e.g. "file.txt"
  // const destFilename = "file.txt";

  // Instantiates a client
  const storage = Storage();

  // Copies the file to the other bucket
  storage
    .bucket(srcBucketName)
    .file(srcFilename)
    .copy(storage.bucket(destBucketName).file(destFilename))
    .then(() => {
      console.log(`gs://${srcBucketName}/${srcFilename} copied to gs://${destBucketName}/${destFilename}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_copy_file]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `list <bucketName> [prefix] [delimiter]`,
    `Lists files in a bucket, optionally filtering by a prefix.`,
    {},
    (opts) => {
      if (opts.prefix) {
        listFilesByPrefix(opts.bucketName, opts.prefix, opts.delimiter);
      } else {
        listFiles(opts.bucketName);
      }
    }
  )
  .command(
    `upload <bucketName> <srcFileName>`,
    `Uploads a local file to a bucket.`,
    {},
    (opts) => uploadFile(opts.bucketName, opts.srcFileName)
  )
  .command(
    `download <bucketName> <srcFileName> <destFileName>`,
    `Downloads a file from a bucket.`,
    {},
    (opts) => downloadFile(opts.bucketName, opts.srcFileName, opts.destFileName)
  )
  .command(
    `delete <bucketName> <fileName>`,
    `Deletes a file from a bucket.`,
    {},
    (opts) => deleteFile(opts.bucketName, opts.fileName)
  )
  .command(
    `get-metadata <bucketName> <fileName>`,
    `Gets the metadata for a file.`,
    {},
    (opts) => getMetadata(opts.bucketName, opts.fileName)
  )
  .command(
    `make-public <bucketName> <fileName>`,
    `Makes a file public.`,
    {},
    (opts) => makePublic(opts.bucketName, opts.fileName)
  )
  .command(
    `generate-signed-url <bucketName> <fileName>`,
    `Generates a signed URL for a file.`,
    {},
    (opts) => generateSignedUrl(opts.bucketName, opts.fileName)
  )
  .command(
    `move <bucketName> <srcFileName> <destFileName>`,
    `Moves a file to a new location within the same bucket, i.e. rename the file.`,
    {},
    (opts) => moveFile(opts.bucketName, opts.srcFileName, opts.destFileName)
  )
  .command(
    `copy <srcBucketName> <srcFileName> <destBucketName> <destFileName>`,
    `Copies a file in a bucket to another bucket.`,
    {},
    (opts) => copyFile(opts.srcBucketName, opts.srcFileName, opts.destBucketName, opts.destFileName)
  )
  .example(`node $0 list my-bucket`, `Lists files in "my-bucket".`)
  .example(`node $0 list my-bucket public/`, `Lists files in "my-bucket" filtered by prefix "public/".`)
  .example(`node $0 upload my-bucket ./file.txt`, `Uploads "./file.txt" to "my-bucket".`)
  .example(`node $0 download my-bucket file.txt ./file.txt`, `Downloads "gs://my-bucket/file.txt" to "./file.txt".`)
  .example(`node $0 delete my-bucket file.txt`, `Deletes "gs://my-bucket/file.txt".`)
  .example(`node $0 get-metadata my-bucket file.txt`, `Gets the metadata for "gs://my-bucket/file.txt".`)
  .example(`node $0 make-public my-bucket file.txt`, `Makes "gs://my-bucket/file.txt" public.`)
  .example(`node $0 move my-bucket file.txt file2.txt`, `Renames "gs://my-bucket/file.txt" to "gs://my-bucket/file2.txt".`)
  .example(`node $0 copy my-bucket file.txt my-other-bucket file.txt`, `Copies "gs://my-bucket/file.txt" to "gs://my-other-bucket/file.txt".`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/storage/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
