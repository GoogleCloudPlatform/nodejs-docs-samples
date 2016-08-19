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
 * @param {object} options Configuration options.
 * @param {string} options.bucket The bucket where the file will be uploaded.
 * @param {string} options.srcFile The local file to be uploaded.
 * @param {string} options.destFile The name of the destination file.
 * @param {string} options.key The encryption key.
 * @param {function} callback The callback function.
 */
function uploadEncryptedFile (options, callback) {
  var bucket = storage.bucket(options.bucket);
  var config = {
    destination: options.destFile,
    encryptionKey: new Buffer(options.key, 'base64')
  };

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/bucket
  bucket.upload(options.srcFile, config, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('Uploaded gs://%s/%s', options.bucket, options.destFile);
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
 * @param {object} options Configuration options.
 * @param {string} options.bucket The bucket from which the file will be downloaded.
 * @param {string} options.srcFile The name of the file to be downloaded.
 * @param {string} options.destFile The local path to which to save the file.
 * @param {string} options.key The encryption key.
 * @param {function} key The callback function.
 */
function downloadEncryptedFile (options, callback) {
  var file = storage.bucket(options.bucket).file(options.srcFile);
  var config = {
    destination: options.destFile
  };

  file.setEncryptionKey(new Buffer(options.key, 'base64'));

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/file
  file.download(config, function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Downloaded gs://%s/%s to %s', options.bucket, options.srcFile, options.destFile);
    return callback(null);
  });
}
// [END download_encrypted_file]

// [START rotate_encryption_key]
/**
 * Performs a key rotation by re-writing an encrypted blob with a new encryption
 * key.
 *
 * @param {function} callback The callback function.
 */
function rotateEncryptionKey (callback) {
  callback(new Error('This is currently not available using the Cloud Client Library.'));
}
// [END rotate_encryption_key]
// [END all]

// The command-line program
var cli = require('yargs');

var program = module.exports = {
  generateEncryptionKey: generateEncryptionKey,
  uploadEncryptedFile: uploadEncryptedFile,
  downloadEncryptedFile: downloadEncryptedFile,
  rotateEncryptionKey: rotateEncryptionKey,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('generate-encryption-key', 'Generate a sample encryption key.', {}, function () {
    program.generateEncryptionKey();
  })
  .command('upload <bucket> <srcFile> <destFile> <key>', 'Upload an encrypted file to a bucket.', {}, function (options) {
    program.uploadEncryptedFile(options, console.log);
  })
  .command('download <bucket> <srcFile> <destFile> <key>', 'Download an encrypted file from a bucket.', {}, function (options) {
    program.downloadEncryptedFile(options, console.log);
  })
  .command('rotate <bucket> <file> <oldkey> <newKey>', 'Rotate encryption keys for a file.', {}, function () {
    program.rotateEncryptionKey(console.log);
  })
  .example('node $0 generate-encryption-key', 'Generate a sample encryption key.')
  .example('node $0 upload my-bucket resources/test.txt file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q=', 'Upload "resources/test.txt" to "gs://my-bucket/file_encrypted.txt".')
  .example('node $0 download my-bucket file_encrypted.txt ./file.txt QxhqaZEqBGVTW55HhQw9Q=', 'Download "gs://my-bucket/file_encrypted.txt" to "./file.txt".')
  .example('node $0 rotate my-bucket file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q= SxafpsdfSDFS89sds9Q=', 'Rotate encryptiong keys for "gs://my-bucket/file_encrypted.txt".')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/storage/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
