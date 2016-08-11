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

// Instantiate a storage client
var storage = gcloud.storage();
// [END setup]

// [START list]
/**
 * Lists files in a bucket.
 *
 * @param {string} name The name of the bucket.
 * @param {function} cb The callback function.
 */
function listFiles (name, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  }

  var bucket = storage.bucket(name);

  bucket.getFiles(function (err, files, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d files!', files.length);
    return callback(null, files);
  });
}
// [END list]

// [START listPrefix]
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
 * @param {string} name The name of the bucket.
 * @param {string} prefix Filter results to objects whose names begin with this prefix.
 * @param {string} [delimiter] Results will contain only objects whose names, aside from the prefix, do not contain delimiter.
 * @param {function} cb The callback function.
 */
function listFilesWithPrefix (name, prefix, delimiter, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!prefix) {
    return callback(new Error('"prefix" is required!'));
  }

  var bucket = storage.bucket(name);
  var options = {
    prefix: prefix
  };
  if (delimiter && typeof delimiter === 'string') {
    options.delimiter = delimiter;
  }

  bucket.getFiles(options, function (err, files, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d files!', files.length);
    return callback(null, files);
  });
}
// [END listPrefix]

// [START upload]
/**
 * Upload a file to a bucket.
 *
 * @param {string} name The name of the bucket.
 * @param {string} fileName The name of the file.
 * @param {function} cb The callback function.
 */
function uploadFile (name, fileName, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!fileName) {
    return callback(new Error('"fileName" is required!'));
  }

  var bucket = storage.bucket(name);

  bucket.upload(fileName, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('Uploaded file: %s', fileName);
    return callback(null, file);
  });
}
// [END upload]

// [START download]
/**
 * Download a file from a bucket.
 *
 * @param {string} name The name of the bucket.
 * @param {string} srcFileName The source file name.
 * @param {string} destFileName The destination file name.
 * @param {function} cb The callback function.
 */
function downloadFile (name, srcFileName, destFileName, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!srcFileName) {
    return callback(new Error('"srcFileName" is required!'));
  } else if (!destFileName) {
    return callback(new Error('"destFileName" is required!'));
  }

  var bucket = storage.bucket(name);
  var file = bucket.file(srcFileName);
  var options = {
    destination: destFileName
  };

  file.download(options, function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Downloaded %s to %s', srcFileName, destFileName);
    return callback(null);
  });
}
// [END download]

// [START delete]
/**
 * Delete a file from a bucket.
 *
 * @param {string} name The name of the bucket.
 * @param {string} fileName The file to delete.
 * @param {function} cb The callback function.
 */
function deleteFile (name, fileName, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!fileName) {
    return callback(new Error('"fileName" is required!'));
  }

  var bucket = storage.bucket(name);
  var file = bucket.file(fileName);

  file.delete(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted file: %s', fileName);
    return callback(null);
  });
}
// [END delete]

// [START metadata]
/**
 * Get a file's metadata.
 *
 * @param {string} name The name of the bucket.
 * @param {string} fileName The name of the file.
 * @param {function} cb The callback function.
 */
function getMetadata (name, fileName, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!fileName) {
    return callback(new Error('"fileName" is required!'));
  }

  var bucket = storage.bucket(name);
  var file = bucket.file(fileName);

  file.getMetadata(function (err, metadata) {
    if (err) {
      return callback(err);
    }

    console.log('Got metadata for file: %s', fileName);
    return callback(null, metadata);
  });
}
// [END metadata]

// [START public]
/**
 * Make a file public.
 *
 * @param {string} name The name of the bucket.
 * @param {string} fileName The name of the file to make public.
 * @param {function} cb The callback function.
 */
function makePublic (name, fileName, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!fileName) {
    return callback(new Error('"fileName" is required!'));
  }

  var bucket = storage.bucket(name);
  var file = bucket.file(fileName);

  file.makePublic(function (err, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Made %s public!', fileName);
    return callback(null, apiResponse);
  });
}
// [END public]

// [START move]
/**
 * Move a file to a new location within the same bucket.
 *
 * @param {string} name The name of the bucket.
 * @param {string} srcFileName The source file name.
 * @param {string} destFileName The destination file name.
 * @param {function} cb The callback function.
 */
function moveFile (name, srcFileName, destFileName, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!srcFileName) {
    return callback(new Error('"srcFileName" is required!'));
  } else if (!destFileName) {
    return callback(new Error('"destFileName" is required!'));
  }

  var bucket = storage.bucket(name);
  var file = bucket.file(srcFileName);

  file.move(destFileName, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('%s moved to %s', srcFileName, destFileName);
    return callback(null, file);
  });
}
// [END move]

// [START copy]
/**
 * Copy a file to a new bucket with a new name.
 *
 * @param {string} name The name of the bucket.
 * @param {string} srcFileName The source file name.
 * @param {string} destBucketName The destination bucket name.
 * @param {string} destFileName The destination file name.
 * @param {function} cb The callback function.
 */
function copyFile (name, srcFileName, destBucketName, destFileName, callback) {
  if (!name) {
    return callback(new Error('"name" is required!'));
  } else if (!srcFileName) {
    return callback(new Error('"srcFileName" is required!'));
  } else if (!destBucketName) {
    return callback(new Error('"destBucketName" is required!'));
  } else if (!destFileName) {
    return callback(new Error('"destFileName" is required!'));
  }

  var bucket = storage.bucket(name);
  var file = bucket.file(srcFileName);
  var newBucket = storage.bucket(destBucketName);
  var newFile = newBucket.file(destFileName);

  file.move(newFile, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('%s moved to %s in %s', srcFileName, destFileName, destBucketName);
    return callback(null, file);
  });
}
// [END copy]

// [START usage]
function printUsage () {
  console.log('Usage: node files COMMAND [ARGS...]');
  console.log('\nCommands:\n');
  console.log('\tlist BUCKET_NAME');
  console.log('\tlistByPrefix BUCKET_NAME PREFIX [DELIMITER]');
  console.log('\tupload BUCKET_NAME FILE_NAME');
  console.log('\tdownload BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME');
  console.log('\tdelete BUCKET_NAME FILE_NAME');
  console.log('\tgetMetadata BUCKET_NAME FILE_NAME');
  console.log('\tmakePublic BUCKET_NAME FILE_NAME');
  console.log('\tmove BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME');
  console.log('\tcopy BUCKET_NAME SRC_FILE_NAME DEST_BUCKET_NAME DEST_FILE_NAME');
  console.log('\nExamples:\n');
  console.log('\tlist my-bucket');
  console.log('\tlistByPrefix my-bucket /some-folder');
  console.log('\tlistByPrefix my-bucket /some-folder -');
  console.log('\tupload my-bucket ./file.txt');
  console.log('\tdownload my-bucket file.txt ./file.txt');
  console.log('\tdelete my-bucket file.txt');
  console.log('\tgetMetadata my-bucket file.txt');
  console.log('\tmakePublic my-bucket file.txt');
  console.log('\tmove my-bucket file.txt file2.txt');
  console.log('\tcopy my-bucket file.txt my-other-bucket file.txt');
}
// [END usage]

// The command-line program
var program = {
  listFiles: listFiles,
  listFilesWithPrefix: listFilesWithPrefix,
  uploadFile: uploadFile,
  downloadFile: downloadFile,
  deleteFile: deleteFile,
  getMetadata: getMetadata,
  makePublic: makePublic,
  moveFile: moveFile,
  copyFile: copyFile,
  printUsage: printUsage,

  // Executed when this program is run from the command-line
  main: function (args, cb) {
    var command = args.shift();
    if (command === 'list') {
      this.listFiles(args[0], cb);
    } else if (command === 'listByPrefix') {
      this.listFilesWithPrefix(args[0], args[1], args[2], cb);
    } else if (command === 'upload') {
      this.uploadFile(args[0], args[1], cb);
    } else if (command === 'download') {
      this.downloadFile(args[0], args[1], args[2], cb);
    } else if (command === 'delete') {
      this.deleteFile(args[0], args[1], cb);
    } else if (command === 'getMetadata') {
      this.getMetadata(args[0], args[1], cb);
    } else if (command === 'makePublic') {
      this.makePublic(args[0], args[1], cb);
    } else if (command === 'move') {
      this.moveFile(args[0], args[1], args[2], cb);
    } else if (command === 'copy') {
      this.copyFile(args[0], args[1], args[2], args[3], cb);
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
