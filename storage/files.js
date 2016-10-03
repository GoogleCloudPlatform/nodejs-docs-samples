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
 * This application demonstrates how to perform basic operations on files with
 * the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

'use strict';

const Storage = require('@google-cloud/storage');

// [START storage_list_files]
function listFiles (bucketName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Lists files in the bucket
  bucket.getFiles((err, files) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Files:');
    files.forEach((file) => console.log(file.name));
    callback();
  });
}
// [END storage_list_files]

// [START storage_list_files_with_prefix]
function listFilesByPrefix (bucketName, prefix, delimiter, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

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
  bucket.getFiles(options, (err, files) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Files:');
    files.forEach((file) => console.log(file.name));
    callback();
  });
}
// [END storage_list_files_with_prefix]

// [START storage_upload_file]
function uploadFile (bucketName, fileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Uploads a local file to the bucket, e.g. "./local/path/to/file.txt"
  bucket.upload(fileName, (err, file) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${file.name} uploaded.`);
    callback();
  });
}
// [END storage_upload_file]

// [START storage_download_file]
function downloadFile (bucketName, srcFileName, destFileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(srcFileName);

  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFileName
  };

  // Downloads the file
  file.download(options, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${file.name} downloaded to ${destFileName}.`);
    callback();
  });
}
// [END storage_download_file]

// [START storage_delete_file]
function deleteFile (bucketName, fileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Deletes the file from the bucket
  file.delete((err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${fileName} deleted.`);
    callback();
  });
}
// [END storage_delete_file]

// [START storage_get_metadata]
function getMetadata (bucketName, fileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Gets the metadata for the file
  file.getMetadata((err, metadata) => {
    if (err) {
      callback(err);
      return;
    }

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
    callback();
  });
}
// [END storage_get_metadata]

// [START storage_make_public]
function makePublic (bucketName, fileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Makes the file public
  file.makePublic((err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${file.name} is now public.`);
    callback();
  });
}
// [END storage_make_public]

// [START storage_generate_signed_url]
function generateSignedUrl (bucketName, fileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  // These options will allow temporary read access to the file
  const options = {
    action: 'read',
    expires: '03-17-2025'
  };

  // Get a signed URL for the file
  file.getSignedUrl(options, (err, url) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`The signed url for ${file.name} is ${url}.`);
    callback();
  });
}
// [END storage_generate_signed_url]

// [START storage_move_file]
function moveFile (bucketName, srcFileName, destFileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(srcFileName);

  // Moves the file within the bucket
  file.move(destFileName, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${file.name} moved to ${destFileName}.`);
    callback();
  });
}
// [END storage_move_file]

// [START storage_copy_file]
function copyFile (srcBucketName, srcFileName, destBucketName, destFileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(srcBucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(srcFileName);

  // References another existing bucket, e.g. "my-other-bucket"
  const destBucket = storageClient.bucket(destBucketName);

  // Creates a reference to a destination file, e.g. "file.txt"
  const destFile = destBucket.file(destFileName);

  // Copies the file to the other bucket
  file.copy(destFile, (err, file) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${srcFileName} copied to ${file.name} in ${destBucket.name}.`);
    callback();
  });
}
// [END storage_copy_file]

// The command-line program
const cli = require(`yargs`);
const noop = require(`../utils`).noop;

const program = module.exports = {
  listFiles: listFiles,
  listFilesByPrefix: listFilesByPrefix,
  uploadFile: uploadFile,
  downloadFile: downloadFile,
  deleteFile: deleteFile,
  getMetadata: getMetadata,
  makePublic: makePublic,
  generateSignedUrl: generateSignedUrl,
  moveFile: moveFile,
  copyFile: copyFile,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`list <bucketName> [prefix] [delimiter]`, `Lists files in a bucket, optionally filtering by a prefix.`, {}, (opts) => {
    if (opts.prefix) {
      program.listFilesByPrefix(opts.bucketName, opts.prefix, opts.delimiter, noop);
    } else {
      program.listFiles(opts.bucketName, noop);
    }
  })
  .command(`upload <bucketName> <srcFileName>`, `Uploads a local file to a bucket.`, {}, (opts) => {
    program.uploadFile(opts.bucketName, opts.srcFileName, noop);
  })
  .command(`download <bucketName> <srcFileName> <destFileName>`, `Downloads a file from a bucket.`, {}, (opts) => {
    program.downloadFile(opts.bucketName, opts.srcFileName, opts.destFileName, noop);
  })
  .command(`delete <bucketName> <fileName>`, `Deletes a file from a bucket.`, {}, (opts) => {
    program.deleteFile(opts.bucketName, opts.fileName, noop);
  })
  .command(`get-metadata <bucketName> <fileName>`, `Gets the metadata for a file.`, {}, (opts) => {
    program.getMetadata(opts.bucketName, opts.fileName, noop);
  })
  .command(`make-public <bucketName> <fileName>`, `Makes a file public.`, {}, (opts) => {
    program.makePublic(opts.bucketName, opts.fileName, noop);
  })
  .command(`generate-signed-url <bucketName> <fileName>`, `Generates a signed URL for a file.`, {}, (opts) => {
    program.generateSignedUrl(opts.bucketName, opts.fileName, noop);
  })
  .command(`move <bucketName> <srcFileName> <destFileName>`, `Moves a file to a new location within the same bucket, i.e. rename the file.`, {}, (opts) => {
    program.moveFile(opts.bucketName, opts.srcFileName, opts.destFileName, noop);
  })
  .command(`copy <srcBucketName> <srcFileName> <destBucketName> <destFileName>`, `Copies a file in a bucket to another bucket.`, {}, (opts) => {
    program.copyFile(opts.srcBucketName, opts.srcFileName, opts.destBucketName, opts.destFileName, noop);
  })
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
  .epilogue(`For more information, see https://cloud.google.com/storage/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
