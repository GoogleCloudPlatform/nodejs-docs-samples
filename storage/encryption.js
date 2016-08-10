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

var crypto = require('crypto');
// [END setup]

// [START generate_encryption_key]
/**
 * Generates a 256 bit (32 byte) AES encryption key and prints the base64
 * representation.
 *
 * This is included for demonstration purposes. You should generate your own
 * key. Please remember that encryption keys should be handled with a
 * comprehensive security policy.
 *
 * @returns {string} The encryption key.
 */
function generateEncryptionKey () {
  var buffer = crypto.randomBytes(32);
  var encodedKey = buffer.toString('base64');

  console.log('Base 64 encoded encryption key: %s', encodedKey);

  return encodedKey;
}
// [END generate_encryption_key]

// [START upload_encrypted_file]
/**
 * Uploads a file to a Google Cloud Storage bucket using a custom encryption key.
 *
 * The file will be encrypted by Google Cloud Storage and only retrievable using
 * the provided encryption key.
 *
 * @param {string} bucketName The bucket where the file will be uploaded.
 * @param {string} srcFileName The local file to be uploaded.
 * @param {string} destFileName The name of the destination file.
 * @param {string} key The encryption key.
 * @param {function} key The callback function.
 */
function uploadEncryptedFile (bucketName, srcFileName, destFileName, key, callback) {
  if (!bucketName) {
    return callback(new Error('"bucketName" is required!'));
  } else if (!srcFileName) {
    return callback(new Error('"srcFileName" is required!'));
  } else if (!destFileName) {
    return callback(new Error('"destFileName" is required!'));
  } else if (!key) {
    return callback(new Error('"key" is required!'));
  }

  var bucket = storage.bucket(bucketName);
  var options = {
    destination: destFileName,
    encryptionKey: new Buffer(key, 'base64')
  };

  bucket.upload(srcFileName, options, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('Uploaded encrypted file: %s', destFileName);
    return callback(null, file);
  });
}
// [END upload_encrypted_file]

// [START download_encrypted_file]
/**
 * Downloads a previously-encrypted file from Google Cloud Storage.
 *
 * The encryption key provided must be the same key provided when uploading the
 * file.
 *
 * @param {string} bucketName The bucket from which the file will be downloaded.
 * @param {string} srcFileName The local file to be downloaded.
 * @param {string} destFileName The name of the destination file.
 * @param {string} key The encryption key.
 * @param {function} key The callback function.
 */
function downloadEncryptedFile (bucketName, srcFileName, destFileName, key, callback) {
  if (!bucketName) {
    return callback(new Error('"bucketName" is required!'));
  } else if (!srcFileName) {
    return callback(new Error('"srcFileName" is required!'));
  } else if (!destFileName) {
    return callback(new Error('"destFileName" is required!'));
  } else if (!key) {
    return callback(new Error('"key" is required!'));
  }

  var bucket = storage.bucket(bucketName);
  var file = bucket.file(srcFileName);
  var options = {
    destination: destFileName
  };

  file.setEncryptionKey(new Buffer(key, 'base64'));

  file.download(options, function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Downloaded encrypted file: %s', destFileName);
    return callback(null);
  });
}
// [END download_encrypted_file]

// [START rotate_encryption_key]
/**
 * Performs a key rotation by re-writing an encrypted blob with a new encryption
 * key.
 *
 * @param {function} key The callback function.
 */
function rotateEncryptionKey (callback) {
  callback(new Error('This is currently not available using the Cloud Client Library.'));
}
// [END rotate_encryption_key]

// [START usage]
function printUsage () {
  console.log('Usage: node encryption COMMAND [ARGS...]');
  console.log('\nCommands:\n');
  console.log('\tgenerate-encryption-key');
  console.log('\tupload BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME KEY');
  console.log('\tdownload BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME KEY');
  console.log('\trotate BUCKET_NAME FILE_NAME OLD_KEY NEW_KEY');
  console.log('\nExamples:\n');
  console.log('\tnode encryption generate-encryption-key');
  console.log('\tnode encryption upload my-bucket resources/test.txt file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q=');
  console.log('\tnode encryption download my-bucket file_encrypted.txt ./file.txt QxhqaZEqBGVTW55HhQw9Q=');
  console.log('\tnode encryption rotate my-bucket file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q= SxafpsdfSDFS89sds9Q=');
}
// [END usage]

// The command-line program
var program = {
  generateEncryptionKey: generateEncryptionKey,
  uploadEncryptedFile: uploadEncryptedFile,
  downloadEncryptedFile: downloadEncryptedFile,
  rotateEncryptionKey: rotateEncryptionKey,
  printUsage: printUsage,

  // Executed when this program is run from the command-line
  main: function (args, cb) {
    var command = args.shift();
    if (command === 'generate-encryption-key') {
      this.generateEncryptionKey();
    } else if (command === 'upload') {
      this.uploadEncryptedFile(args[0], args[1], args[2], args[3], cb);
    } else if (command === 'download') {
      this.downloadEncryptedFile(args[0], args[1], args[2], args[3], cb);
    } else if (command === 'rotate') {
      this.rotateEncryptionKey(cb);
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
