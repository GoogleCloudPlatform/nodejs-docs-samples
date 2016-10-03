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
 * This application demonstrates how to perform basic operations on bucket and
 * file Access Control Lists with the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

'use strict';

const Storage = require('@google-cloud/storage');

// [START storage_print_bucket_acl]
function printBucketAcl (bucketName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Gets the ACL for the bucket
  bucket.acl.get((err, aclObjects) => {
    if (err) {
      callback(err);
      return;
    }

    aclObjects.forEach((aclObject) => {
      console.log(`${aclObject.role}: ${aclObject.entity}`);
    });
    callback();
  });
}
// [END storage_print_bucket_acl]

// [START storage_print_bucket_acl_for_user]
function printBucketAclForUser (bucketName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  const options = {
    // Specify the user
    entity: `user-${userEmail}`
  };

  // Gets the user's ACL for the bucket
  bucket.acl.get(options, (err, aclObject) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`${aclObject.role}: ${aclObject.entity}`);
    callback();
  });
}
// [END storage_print_bucket_acl_for_user]

// [START storage_add_bucket_owner]
function addBucketOwner (bucketName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Makes the user an owner of the bucket. You can use addAllUsers(),
  // addDomain(), addProject(), addGroup(), and addAllAuthenticatedUsers()
  // to grant access to different types of entities. You can also use "readers"
  // and "writers" to grant different roles.
  bucket.acl.owners.addUser(userEmail, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Added user ${userEmail} as an owner on bucket ${bucketName}.`);
    callback();
  });
}
// [END storage_add_bucket_owner]

// [START storage_remove_bucket_owner]
function removeBucketOwner (bucketName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Removes the user from the access control list of the bucket. You can use
  // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
  // deleteAllAuthenticatedUsers() to remove access for different types of entities.
  bucket.acl.owners.deleteUser(userEmail, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Removed user ${userEmail} from bucket ${bucketName}.`);
    callback();
  });
}
// [END storage_remove_bucket_owner]

// [START storage_add_bucket_default_owner]
function addBucketDefaultOwner (bucketName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Makes the user an owner in the default ACL of the bucket. You can use
  // addAllUsers(), addDomain(), addProject(), addGroup(), and
  // addAllAuthenticatedUsers() to grant access to different types of entities.
  // You can also use "readers" and "writers" to grant different roles.
  bucket.acl.default.owners.addUser(userEmail, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Added user ${userEmail} as an owner on bucket ${bucketName}.`);
    callback();
  });
}
// [END storage_add_bucket_default_owner]

// [START storage_remove_bucket_default_owner]
function removeBucketDefaultOwner (bucketName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // Removes the user from the access control list of the bucket. You can use
  // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
  // deleteAllAuthenticatedUsers() to remove access for different types of entities.
  bucket.acl.default.owners.deleteUser(userEmail, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Removed user ${userEmail} from bucket ${bucketName}.`);
    callback();
  });
}
// [END storage_remove_bucket_default_owner]

// [START storage_print_file_acl]
function printFileAcl (bucketName, fileName, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Gets the ACL for the file
  file.acl.get((err, aclObjects) => {
    if (err) {
      callback(err);
      return;
    }

    aclObjects.forEach((aclObject) => {
      console.log(`${aclObject.role}: ${aclObject.entity}`);
    });
    callback();
  });
}
// [END storage_print_file_acl]

// [START storage_print_file_acl_for_user]
function printFileAclForUser (bucketName, fileName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  const options = {
    // Specify the user
    entity: `user-${userEmail}`
  };

  // Gets the user's ACL for the file
  file.acl.get(options, (err, aclObject) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`${aclObject.role}: ${aclObject.entity}`);
    callback();
  });
}
// [END storage_print_file_acl_for_user]

// [START storage_add_file_owner]
function addFileOwner (bucketName, fileName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Makes the user an owner of the file. You can use addAllUsers(),
  // addDomain(), addProject(), addGroup(), and addAllAuthenticatedUsers()
  // to grant access to different types of entities. You can also use "readers"
  // and "writers" to grant different roles.
  file.acl.owners.addUser(userEmail, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Added user ${userEmail} as an owner on file ${fileName}.`);
    callback();
  });
}
// [END storage_add_file_owner]

// [START storage_remove_file_owner]
function removeFileOwner (bucketName, fileName, userEmail, callback) {
  // Instantiates a client
  const storageClient = Storage();

  // References an existing bucket, e.g. "my-bucket"
  const bucket = storageClient.bucket(bucketName);

  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Removes the user from the access control list of the file. You can use
  // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
  // deleteAllAuthenticatedUsers() to remove access for different types of entities.
  file.acl.owners.deleteUser(userEmail, (err) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(`Removed user ${userEmail} from file ${fileName}.`);
    callback();
  });
}
// [END storage_remove_file_owner]

// The command-line program
const cli = require(`yargs`);
const utils = require(`../utils`);

const program = module.exports = {
  printBucketAcl: printBucketAcl,
  printBucketAclForUser: printBucketAclForUser,
  addBucketOwner: addBucketOwner,
  removeBucketOwner: removeBucketOwner,
  addBucketDefaultOwner: addBucketDefaultOwner,
  removeBucketDefaultOwner: removeBucketDefaultOwner,
  printFileAcl: printFileAcl,
  printFileAclForUser: printFileAclForUser,
  addFileOwner: addFileOwner,
  removeFileOwner: removeFileOwner,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`print-bucket-acl <bucketName>`, `Prints the ACL for a bucket.`, {}, (opts) => {
    program.printBucketAcl(opts.bucketName, utils.noop);
  })
  .command(`print-bucket-acl-for-user <bucketName> <userEmail>`, `Prints a user's ACL for a bucket.`, {}, (opts) => {
    program.printBucketAclForUser(opts.bucketName, opts.userEmail, utils.noop);
  })
  .command(`add-bucket-owner <bucketName> <userEmail>`, `Adds a user as an owner of a bucket.`, {}, (opts) => {
    program.addBucketOwner(opts.bucketName, opts.userEmail, utils.noop);
  })
  .command(`remove-bucket-owner <bucketName> <userEmail>`, `Removes a user from the ACL of a bucket.`, {}, (opts) => {
    program.removeBucketOwner(opts.bucketName, opts.userEmail, utils.noop);
  })
  .command(`add-bucket-default-owner <bucketName> <userEmail>`, `Adds a user as an owner in the default ACL of a bucket.`, {}, (opts) => {
    program.addBucketDefaultOwner(opts.bucketName, opts.userEmail, utils.noop);
  })
  .command(`remove-bucket-default-owner <bucketName> <userEmail>`, `Removes a user from the default ACL of a bucket.`, {}, (opts) => {
    program.removeBucketDefaultOwner(opts.bucketName, opts.userEmail, utils.noop);
  })
  .command(`print-file-acl <bucketName> <fileName>`, `Prints the ACL for a file.`, {}, (opts) => {
    program.printFileAcl(opts.bucketName, opts.fileName, utils.noop);
  })
  .command(`print-file-acl-for-user <bucketName> <fileName> <userEmail>`, `Prints a user's ACL for a file.`, {}, (opts) => {
    program.printFileAclForUser(opts.bucketName, opts.fileName, opts.userEmail, utils.noop);
  })
  .command(`add-file-owner <bucketName> <fileName> <userEmail>`, `Adds a user as an owner of a file.`, {}, (opts) => {
    program.addFileOwner(opts.bucketName, opts.fileName, opts.userEmail, utils.noop);
  })
  .command(`remove-file-owner <bucketName> <fileName> <userEmail>`, `Removes a user from the ACL of a file.`, {}, (opts) => {
    program.removeFileOwner(opts.bucketName, opts.fileName, opts.userEmail, utils.noop);
  })
  .example(`node $0 print-bucket-acl my-bucket`, `Prints the ACL for a bucket named "my-bucket".`)
  .example(`node $0 print-bucket-acl-for-user my-bucket bob@company.com`, `Prints a user's ACL for a bucket named "my-bucket".`)
  .example(`node $0 add-bucket-owner my-bucket bob@company.com`, `Adds "bob@company.com" as an owner of a bucket named "my-bucket".`)
  .example(`node $0 remove-bucket-owner my-bucket bob@company.com`, `Removes "bob@company.com" from the ACL of a bucket named "my-bucket".`)
  .example(`node $0 add-bucket-default-owner my-bucket bob@company.com`, `Adds "bob@company.com" as an owner in the default ACL of a bucket named "my-bucket".`)
  .example(`node $0 remove-bucket-default-owner my-bucket bob@company.com`, `Removes "bob@company.com" from the default ACL of a bucket named "my-bucket".`)
  .example(`node $0 print-file-acl my-bucket file.txt`, `Prints the ACL for a file named "file.txt".`)
  .example(`node $0 print-file-acl-for-user my-bucket file.txt bob@company.com`, `Prints a user's ACL for a file named "file.txt".`)
  .example(`node $0 add-file-owner my-bucket file.txt bob@company.com`, `Adds "bob@company.com" as an owner of a file named "file.txt".`)
  .example(`node $0 remove-file-owner my-bucket file.txt bob@company.com`, `Removes "bob@company.com" from the ACL of a file named "file.txt".`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/storage/docs/access-control/create-manage-lists`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
