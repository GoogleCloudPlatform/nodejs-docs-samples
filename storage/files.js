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

// [START list_files]
/**
 * Lists files in a bucket.
 *
 * @param {string} name The name of the bucket.
 * @param {function} cb The callback function.
 */
function listFiles (name, callback) {
  var bucket = storage.bucket(name);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/bucket
  bucket.getFiles(function (err, files) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d file(s)!', files.length);
    return callback(null, files);
  });
}
// [END list_files]

// [START list_files_with_prefix]
/**
 * Lists files in a bucket that match a certain prefix.
 *
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
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.prefix Filter results to objects whose names begin
 *     with this prefix.
 * @param {string} [options.delimiter] Optional. Results will contain only
 *     objects whose names, aside from the prefix, do not contain delimiter.
 * @param {function} cb The callback function.
 */
function listFilesByPrefix (options, callback) {
  var bucket = storage.bucket(options.bucket);

  var config = {
    prefix: options.prefix
  };
  if (options.delimiter) {
    config.delimiter = options.delimiter;
  }

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/bucket
  bucket.getFiles(config, function (err, files) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d file(s)!', files.length);
    return callback(null, files);
  });
}
// [END list_files_with_prefix]

// [START upload_file]
/**
 * Upload a file to a bucket.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.srcFile The name of the file.
 * @param {function} cb The callback function.
 */
function uploadFile (options, callback) {
  var bucket = storage.bucket(options.bucket);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/bucket
  bucket.upload(options.srcFile, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('Uploaded gs://%s/%s', options.bucket, options.srcFile);
    return callback(null, file);
  });
}
// [END upload_file]

// [START download_file]
/**
 * Download a file from a bucket.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.srcFile The source file name.
 * @param {string} options.destFile The destination file name.
 * @param {function} cb The callback function.
 */
function downloadFile (options, callback) {
  var file = storage.bucket(options.bucket).file(options.srcFile);

  var config = {
    destination: options.destFile
  };

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/file
  file.download(config, function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Downloaded gs://%s/%s to %s', options.bucket, options.srcFile, options.destFile);
    return callback(null);
  });
}
// [END download_file]

// [START delete_file]
/**
 * Delete a file from a bucket.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.file The name of the file to delete.
 * @param {function} cb The callback function.
 */
function deleteFile (options, callback) {
  var file = storage.bucket(options.bucket).file(options.file);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/file
  file.delete(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted gs://%s/%s', options.bucket, options.file);
    return callback(null);
  });
}
// [END delete_file]

// [START get_metadata]
/**
 * Get a file's metadata.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.file The name of the file.
 * @param {function} cb The callback function.
 */
function getMetadata (options, callback) {
  var file = storage.bucket(options.bucket).file(options.file);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/file
  file.getMetadata(function (err, metadata) {
    if (err) {
      return callback(err);
    }

    console.log('Got metadata for gs://%s/%s', options.bucket, options.file);
    return callback(null, metadata);
  });
}
// [END get_metadata]

// [START public]
/**
 * Make a file public.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.file The name of the file to make public.
 * @param {function} cb The callback function.
 */
function makePublic (options, callback) {
  var file = storage.bucket(options.bucket).file(options.file);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/file
  file.makePublic(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Made gs://%s/%s public!', options.bucket, options.file);
    return callback(null);
  });
}
// [END public]

// [START move_file]
/**
 * Move a file to a new location within the same bucket, i.e. rename the file.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.srcFile The source file name.
 * @param {string} options.destFile The destination file name.
 * @param {function} cb The callback function.
 */
function moveFile (options, callback) {
  var file = storage.bucket(options.bucket).file(options.srcFile);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/file
  file.move(options.destFile, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('Renamed gs://%s/%s to gs://%s/%s', options.bucket, options.srcFile, options.bucket, options.destFile);
    return callback(null, file);
  });
}
// [END move_file]

// [START copy_file]
/**
 * Copy a file to a new bucket with a new name.
 *
 * @param {object} options Configuration options.
 * @param {string} options.srcBucket The name of the bucket.
 * @param {string} options.srcFile The source file name.
 * @param {string} options.destBucket The destination bucket name.
 * @param {string} options.destFile The destination file name.
 * @param {function} cb The callback function.
 */
function copyFile (options, callback) {
  var file = storage.bucket(options.srcBucket).file(options.srcFile);
  var copy = storage.bucket(options.destBucket).file(options.destFile);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/file
  file.copy(copy, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('Copied gs://%s/%s to gs://%s/%s', options.srcBucket, options.srcFile, options.destBucket, options.destFile);
    return callback(null, file);
  });
}
// [END copy_file]
// [END all]

// The command-line program
var cli = require('yargs');

var program = module.exports = {
  listFiles: listFiles,
  listFilesByPrefix: listFilesByPrefix,
  uploadFile: uploadFile,
  downloadFile: downloadFile,
  deleteFile: deleteFile,
  getMetadata: getMetadata,
  makePublic: makePublic,
  moveFile: moveFile,
  copyFile: copyFile,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('list <bucket> [options]', 'List files in a bucket, optionally filtering by a prefix.', {
    prefix: {
      alias: 'p',
      requiresArg: true,
      type: 'string',
      description: 'Filter files by a prefix.'
    },
    delimiter: {
      alias: 'd',
      requiresArg: true,
      type: 'string',
      description: 'Specify a delimiter.'
    }
  }, function (options) {
    if (options.prefix) {
      program.listFilesByPrefix(options, console.log);
    } else {
      program.listFiles(options.bucket, console.log);
    }
  })
  .command('upload <bucket> <srcFile>', 'Upload a local file to a bucket.', {}, function (options) {
    program.uploadFile(options, console.log);
  })
  .command('download <bucket> <srcFile> <destFile>', 'Download a file from a bucket.', {}, function (options) {
    program.downloadFile(options, console.log);
  })
  .command('delete <bucket> <file>', 'Delete a file from a bucket.', {}, function (options) {
    program.deleteFile(options, console.log);
  })
  .command('getMetadata <bucket> <file>', 'Get metadata for a file in a bucket.', {}, function (options) {
    program.getMetadata(options, console.log);
  })
  .command('makePublic <bucket> <file>', 'Make a file public in a bucket.', {}, function (options) {
    program.makePublic(options, console.log);
  })
  .command('move <bucket> <srcFile> <destFile>', 'Move a file to a new location within the same bucket, i.e. rename the file.', {}, function (options) {
    program.moveFile(options, console.log);
  })
  .command('copy <srcBucket> <srcFile> <destBucket> <destFile>', 'Copy a file in a bucket to another bucket.', {}, function (options) {
    program.copyFile(options, console.log);
  })
  .example('node $0 list my-bucket', 'List files in "my-bucket".')
  .example('node $0 list my-bucket -p public/', 'List files in "my-bucket" filtered by prefix "public/".')
  .example('node $0 upload my-bucket ./file.txt', 'Upload "./file.txt" to "my-bucket".')
  .example('node $0 download my-bucket file.txt ./file.txt', 'Download "gs://my-bucket/file.txt" to "./file.txt".')
  .example('node $0 delete my-bucket file.txt', 'Delete "gs://my-bucket/file.txt".')
  .example('node $0 getMetadata my-bucket file.txt', 'Get metadata for "gs://my-bucket/file.txt".')
  .example('node $0 makePublic my-bucket file.txt', 'Make "gs://my-bucket/file.txt" public.')
  .example('node $0 move my-bucket file.txt file2.txt', 'Rename "gs://my-bucket/file.txt" to "gs://my-bucket/file2.txt".')
  .example('node $0 copy my-bucket file.txt my-other-bucket file.txt', 'Copy "gs://my-bucket/file.txt" to "gs://my-other-bucket/file.txt".')
  .wrap(100)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/storage/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
