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
 * This application demonstrates how to perform basic operations on bucket and
 * file Access Control Lists with the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

'use strict';

function printBucketAcl (bucketName) {
  // [START storage_print_bucket_acl]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // Instantiates a client
  const storage = Storage();

  // Gets the ACL for the bucket
  storage
    .bucket(bucketName)
    .acl
    .get()
    .then((results) => {
      const acls = results[0];

      acls.forEach((acl) => {
        console.log(`${acl.role}: ${acl.entity}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_print_bucket_acl]
}

function printBucketAclForUser (bucketName, userEmail) {
  // [START storage_print_bucket_acl_for_user]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The email of the user to check, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  const options = {
    // Specify the user
    entity: `user-${userEmail}`
  };

  // Gets the user's ACL for the bucket
  storage
    .bucket(bucketName)
    .acl
    .get(options)
    .then((results) => {
      const aclObject = results[0];

      console.log(`${aclObject.role}: ${aclObject.entity}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_print_bucket_acl_for_user]
}

function addBucketOwner (bucketName, userEmail) {
  // [START storage_add_bucket_owner]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The email of the user to add, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  // Makes the user an owner of the bucket. You can use addAllUsers(),
  // addDomain(), addProject(), addGroup(), and addAllAuthenticatedUsers()
  // to grant access to different types of entities. You can also use "readers"
  // and "writers" to grant different roles.
  storage
    .bucket(bucketName)
    .acl
    .owners
    .addUser(userEmail)
    .then(() => {
      console.log(`Added user ${userEmail} as an owner on bucket ${bucketName}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_add_bucket_owner]
}

function removeBucketOwner (bucketName, userEmail) {
  // [START storage_remove_bucket_owner]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The email of the user to remove, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  // Removes the user from the access control list of the bucket. You can use
  // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
  // deleteAllAuthenticatedUsers() to remove access for different types of entities.
  storage
    .bucket(bucketName)
    .acl
    .owners
    .deleteUser(userEmail)
    .then(() => {
      console.log(`Removed user ${userEmail} from bucket ${bucketName}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_remove_bucket_owner]
}

function addBucketDefaultOwner (bucketName, userEmail) {
  // [START storage_add_bucket_default_owner]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The email of the user to add, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  // Makes the user an owner in the default ACL of the bucket. You can use
  // addAllUsers(), addDomain(), addProject(), addGroup(), and
  // addAllAuthenticatedUsers() to grant access to different types of entities.
  // You can also use "readers" and "writers" to grant different roles.
  storage
    .bucket(bucketName)
    .acl
    .default
    .owners
    .addUser(userEmail)
    .then(() => {
      console.log(`Added user ${userEmail} as an owner on bucket ${bucketName}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_add_bucket_default_owner]
}

function removeBucketDefaultOwner (bucketName, userEmail) {
  // [START storage_remove_bucket_default_owner]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The email of the user to remove, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  // Removes the user from the access control list of the bucket. You can use
  // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
  // deleteAllAuthenticatedUsers() to remove access for different types of entities.
  storage
    .bucket(bucketName)
    .acl
    .default
    .owners
    .deleteUser(userEmail)
    .then(() => {
      console.log(`Removed user ${userEmail} from bucket ${bucketName}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_remove_bucket_default_owner]
}

function printFileAcl (bucketName, filename) {
  // [START storage_print_file_acl]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to access, e.g. "file.txt"
  // const filename = "file.txt";

  // Instantiates a client
  const storage = Storage();

  // Gets the ACL for the file
  storage
    .bucket(bucketName)
    .file(filename)
    .acl
    .get()
    .then((results) => {
      const acls = results[0];

      acls.forEach((acl) => {
        console.log(`${acl.role}: ${acl.entity}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_print_file_acl]
}

function printFileAclForUser (bucketName, filename, userEmail) {
  // [START storage_print_file_acl_for_user]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to access, e.g. "file.txt"
  // const filename = "file.txt";

  // The email of the user to check, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  const options = {
    // Specify the user
    entity: `user-${userEmail}`
  };

  // Gets the user's ACL for the file
  storage
    .bucket(bucketName)
    .file(filename)
    .acl
    .get(options)
    .then((results) => {
      const aclObject = results[0];

      console.log(`${aclObject.role}: ${aclObject.entity}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_print_file_acl_for_user]
}

function addFileOwner (bucketName, filename, userEmail) {
  // [START storage_add_file_owner]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to access, e.g. "file.txt"
  // const filename = "file.txt";

  // The email of the user to add, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  // Makes the user an owner of the file. You can use addAllUsers(),
  // addDomain(), addProject(), addGroup(), and addAllAuthenticatedUsers()
  // to grant access to different types of entities. You can also use "readers"
  // and "writers" to grant different roles.
  storage
    .bucket(bucketName)
    .file(filename)
    .acl
    .owners
    .addUser(userEmail)
    .then(() => {
      console.log(`Added user ${userEmail} as an owner on file ${filename}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END storage_add_file_owner]
}

// [START storage_remove_file_owner]
function removeFileOwner (bucketName, filename, userEmail) {
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // The name of the bucket to access, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file to access, e.g. "file.txt"
  // const filename = "file.txt";

  // The email of the user to remove, e.g. "developer@company.com"
  // const userEmail = "developer@company.com";

  // Instantiates a client
  const storage = Storage();

  // Removes the user from the access control list of the file. You can use
  // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
  // deleteAllAuthenticatedUsers() to remove access for different types of entities.
  storage
    .bucket(bucketName)
    .file(filename)
    .acl
    .owners
    .deleteUser(userEmail)
    .then(() => {
      console.log(`Removed user ${userEmail} from file ${filename}.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
}
// [END storage_remove_file_owner]

const cli = require(`yargs`)
  .demand(1)
  .command(
    `print-bucket-acl <bucketName>`,
    `Prints the ACL for a bucket.`,
    {},
    (opts) => printBucketAcl(opts.bucketName)
  )
  .command(
    `print-bucket-acl-for-user <bucketName> <userEmail>`,
    `Prints a user's ACL for a bucket.`,
    {},
    (opts) => printBucketAclForUser(opts.bucketName, opts.userEmail)
  )
  .command(
    `add-bucket-owner <bucketName> <userEmail>`,
    `Adds a user as an owner of a bucket.`,
    {},
    (opts) => addBucketOwner(opts.bucketName, opts.userEmail)
  )
  .command(
    `remove-bucket-owner <bucketName> <userEmail>`,
    `Removes a user from the ACL of a bucket.`,
    {},
    (opts) => removeBucketOwner(opts.bucketName, opts.userEmail)
  )
  .command(
    `add-bucket-default-owner <bucketName> <userEmail>`,
    `Adds a user as an owner in the default ACL of a bucket.`,
    {},
    (opts) => addBucketDefaultOwner(opts.bucketName, opts.userEmail)
  )
  .command(
    `remove-bucket-default-owner <bucketName> <userEmail>`,
    `Removes a user from the default ACL of a bucket.`,
    {},
    (opts) => removeBucketDefaultOwner(opts.bucketName, opts.userEmail)
  )
  .command(
    `print-file-acl <bucketName> <fileName>`,
    `Prints the ACL for a file.`,
    {},
    (opts) => printFileAcl(opts.bucketName, opts.fileName)
  )
  .command(
    `print-file-acl-for-user <bucketName> <fileName> <userEmail>`,
    `Prints a user's ACL for a file.`,
    {},
    (opts) => printFileAclForUser(opts.bucketName, opts.fileName, opts.userEmail)
  )
  .command(
    `add-file-owner <bucketName> <fileName> <userEmail>`,
    `Adds a user as an owner of a file.`,
    {},
    (opts) => addFileOwner(opts.bucketName, opts.fileName, opts.userEmail)
  )
  .command(
    `remove-file-owner <bucketName> <fileName> <userEmail>`,
    `Removes a user from the ACL of a file.`,
    {},
    (opts) => removeFileOwner(opts.bucketName, opts.fileName, opts.userEmail)
  )
  .example(`node $0 print-bucket-acl my-bucket`)
  .example(`node $0 print-bucket-acl-for-user my-bucket bob@company.com`)
  .example(`node $0 add-bucket-owner my-bucket bob@company.com`)
  .example(`node $0 remove-bucket-owner my-bucket bob@company.com`)
  .example(`node $0 add-bucket-default-owner my-bucket bob@company.com`)
  .example(`node $0 remove-bucket-default-owner my-bucket bob@company.com`)
  .example(`node $0 print-file-acl my-bucket file.txt`)
  .example(`node $0 print-file-acl-for-user my-bucket file.txt bob@company.com`)
  .example(`node $0 add-file-owner my-bucket file.txt bob@company.com`)
  .example(`node $0 remove-file-owner my-bucket file.txt bob@company.com`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/storage/docs/access-control/create-manage-lists`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
