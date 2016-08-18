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

// [START add_access_control]
/**
 * Add access controls to a bucket or file.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The bucket for the new access controls.
 * @param {string} options.entity The entity for the new access controls.
 * @param {string} options.role The role for the new access controls.
 * @param {string} [options.file] Optional. The file for the new access controls.
 * @param {boolean} [options.default] Optional. Whether to set default access controls.
 * @param {function} callback The callback function.
 */
function addAccessControl (options, callback) {
  // Reference the specified storage bucket
  var bucket = storage.bucket(options.bucket);
  // Reference the bucket's acl resource
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/bucket?method=acl.add
  var acl = bucket.acl;

  if (options.file) {
    // Optionally target a file's acl resource
    // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/file?method=acl.add
    acl = bucket.file(options.file).acl;
  } else if (options.default) {
    // Optionally add "default" access controls to the bucket
    // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/bucket?method=acl.default.add
    acl = acl.default;
  }

  // Specify the entity and role for the new access control object
  var config = {
    entity: options.entity,
    role: options.role
  };

  acl.add(config, function (err, aclObject) {
    if (err) {
      return callback(err);
    }

    console.log('Added access controls to: gs://%s' + (options.file ? '/%s' : ''), options.bucket, options.file || '');
    return callback(null, aclObject);
  });
}
// [END add_access_control]

// [START get_access_control]
/**
 * Get access controls for a bucket or file.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The bucket to target.
 * @param {string} [options.entity] Optional. The entity to filter by.
 * @param {string} [options.file] Optional. The file to target.
 * @param {boolean} [options.default] Optional. Whether to get default access controls.
 * @param {function} callback The callback function.
 */
function getAccessControl (options, callback) {
  // Reference the specified storage bucket
  var bucket = storage.bucket(options.bucket);
  // Reference the bucket's acl resource
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/bucket?method=acl.get
  var acl = bucket.acl;

  if (options.file) {
    // Optionally target a file's acl resource
    // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/file?method=acl.get
    acl = bucket.file(options.file).acl;
  } else if (options.default) {
    // Optionally get "default" access controls for the bucket
    // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/bucket?method=acl.default.get
    acl = acl.default;
  }

  if (options.entity) {
    // Get a list of access controls for a specific entity
    acl.get({ entity: options.entity }, handleResponse);
  } else {
    // Get a list of all access controls
    acl.get(handleResponse);
  }

  function handleResponse (err, aclObject) {
    if (err) {
      return callback(err);
    }

    console.log('Got access controls for: gs://%s' + (options.file ? '/%s' : ''), options.bucket, options.file || '');
    return callback(null, aclObject);
  }
}
// [END get_access_control]

// [START delete_access_control]
/**
 * Delete access controls from a bucket or file.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The bucket to target.
 * @param {string} options.entity The entity whose access is to be revoked.
 * @param {string} [options.file] Optional. The file to target.
 * @param {boolean} [options.default] Optional. Whether to delete default access controls.
 * @param {function} callback The callback function.
 */
function deleteAccessControl (options, callback) {
  // Reference the specified storage bucket
  var bucket = storage.bucket(options.bucket);
  // Reference the bucket's acl resource
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/bucket?method=acl.delete
  var acl = bucket.acl;

  if (options.file) {
    // Optionally target a file's acl resource
    // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/file?method=acl.delete
    acl = bucket.file(options.file).acl;
  } else if (options.default) {
    // Optionally delete "default" access controls from the bucket
    // See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/storage/bucket?method=acl.default.delete
    acl = acl.default;
  }

  // Delete access controls for a specific entity
  acl.delete({ entity: options.entity }, function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted access controls from: gs://%s' + (options.file ? '/%s' : ''), options.bucket, options.file || '');
    return callback(null);
  });
}
// [END delete_access_control]
// [END all]

// The command-line program
var cli = require('yargs');

var program = module.exports = {
  addAccessControl: addAccessControl,
  getAccessControl: getAccessControl,
  deleteAccessControl: deleteAccessControl,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .command('add <entity> <role>', 'Add access controls on a bucket or file.', {}, function (options) {
    program.addAccessControl(options, console.log);
  })
  .command('get [entity]', 'Get access controls on a bucket or file.', {}, function (options) {
    program.getAccessControl(options, console.log);
  })
  .command('delete <entity>', 'Delete access controls from a bucket or file.', {}, function (options) {
    program.deleteAccessControl(options, console.log);
  })
  .example('node $0 add user-bob@domain.com OWNER -b mybucket', 'Add OWNER access controls for "user-bob@domain.com" to "mybucket".')
  .example('node $0 add viewers-2256 WRITER -b mybucket -d', 'Add default WRITER access controls to "mybucket" for "viewers-2256".')
  .example('node $0 get editors-1234 -b mybucket', 'Get access controls for "editors-1234" in "mybucket".')
  .example('node $0 delete -b mybucket -f file.txt', 'Delete all access controls for all entities from "file.txt" in "mybucket".')
  .options({
    bucket: {
      alias: 'b',
      global: true,
      demand: true,
      requiresArg: true,
      type: 'string',
      description: 'The target storage bucket.'
    },
    default: {
      alias: 'd',
      global: true,
      type: 'boolean',
      description: 'Whether to set default access controls. Only valid when setting access controls on a bucket.'
    },
    file: {
      alias: 'f',
      global: true,
      requiresArg: true,
      type: 'string',
      description: 'The target file.'
    }
  })
  .wrap(100)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/storage/docs/access-control/create-manage-lists');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
