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
 * This application demonstrates how to perform basic operations on encrypted
 * files with the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

'use strict';

const Storage = require('@google-cloud/storage');
const crypto = require('crypto');

// [START storage_generate_encryption_key]
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
  const buffer = crypto.randomBytes(32);
  const encodedKey = buffer.toString('base64');

  console.log(`Base 64 encoded encryption key: ${encodedKey}`);

  return encodedKey;
}
// [END storage_generate_encryption_key]

// [START storage_upload_encrypted_file]
function uploadEncryptedFile (bucketName, srcFileName, destFileName, key, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  const config = {
    // The path to which the file should be uploaded, e.g. "file_encrypted.txt"
    destination: destFileName,
    // Encrypt the file with a customer-supplied key, e.g. "my-secret-key"
    encryptionKey: new Buffer(key, 'base64')
  };

  // Encrypts and uploads a local file, e.g. "./local/path/to/file.txt".
  // The file will only be retrievable using the key used to upload it.
  bucket.upload(srcFileName, config, (err, file) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${srcFileName} uploaded to ${file.name}.`);
    callback();
  });
}
// [END storage_upload_encrypted_file]

// [START storage_download_encrypted_file]
function downloadEncryptedFile (bucketName, srcFileName, destFileName, key, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file_encrypted.txt"
  const file = bucket.file(srcFileName);

  const config = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFileName
  };

  // Specifies the key that should be used to decrypt the file
  file.setEncryptionKey(new Buffer(key, 'base64'));

  // Descrypts and downloads the file. This can only be done with the key used
  // to encrypt and upload the file.
  file.download(config, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`File ${file.name} downloaded to ${destFileName}.`);
    callback();
  });
}
// [END storage_download_encrypted_file]

// [START storage_rotate_encryption_key]
function rotateEncryptionKey (callback) {
  callback(new Error('This is currently not available using the Cloud Client Library.'));
}
// [END storage_rotate_encryption_key]
// [END all]

// The command-line program
const cli = require(`yargs`);
const noop = require(`../utils`).noop;

const program = module.exports = {
  generateEncryptionKey: generateEncryptionKey,
  uploadEncryptedFile: uploadEncryptedFile,
  downloadEncryptedFile: downloadEncryptedFile,
  rotateEncryptionKey: rotateEncryptionKey,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`generate-encryption-key`, `Generate a sample encryption key.`, {}, () => {
    program.generateEncryptionKey();
  })
  .command(`upload <bucketName> <srcFileName> <destFileName> <key>`, `Encrypts and uploads a file.`, {}, (opts) => {
    program.uploadEncryptedFile(opts.bucketName, opts.srcFileName, opts.destFileName, opts.key, noop);
  })
  .command(`download <bucketName> <srcFileName> <destFileName> <key>`, `Decrypts and downloads a file.`, {}, (opts) => {
    program.downloadEncryptedFile(opts.bucketName, opts.srcFileName, opts.destFileName, opts.key, noop);
  })
  .command(`rotate <bucketName> <fileName> <oldkey> <newKey>`, `Rotates encryption keys for a file.`, {}, () => {
    program.rotateEncryptionKey(noop);
  })
  .example(`node $0 generate-encryption-key`, `Generate a sample encryption key.`)
  .example(`node $0 upload my-bucket ./resources/test.txt file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q=`, `Encrypts and uploads "resources/test.txt" to "gs://my-bucket/file_encrypted.txt".`)
  .example(`node $0 download my-bucket file_encrypted.txt ./file.txt QxhqaZEqBGVTW55HhQw9Q=`, `Decrypts and downloads "gs://my-bucket/file_encrypted.txt" to "./file.txt".`)
  .example(`node $0 rotate my-bucket file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q= SxafpsdfSDFS89sds9Q=`, `Rotates encryption keys for "gs://my-bucket/file_encrypted.txt".`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/storage/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
