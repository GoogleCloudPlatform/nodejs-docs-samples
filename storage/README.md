<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Storage Node.js Samples

[Cloud Storage][storage_docs] allows world-wide storage and retrieval of any
amount of data at any time.

[storage_docs]: https://cloud.google.com/storage/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [ACL (Access Control Lists)](#acl-access-control-lists)
  * [Buckets](#buckets)
  * [Encryption](#encryption)
  * [Files](#files)
  * [Storage Transfer API](#storage-transfer-api)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### ACL (Access Control Lists)

View the [documentation][acl_docs] or the [source code][acl_code].

__Usage:__ `node acl --help`

```
Commands:
  print-bucket-acl <bucketName>                                Prints the ACL for a bucket.
  print-bucket-acl-for-user <bucketName> <userEmail>           Prints a user's ACL for a bucket.
  add-bucket-owner <bucketName> <userEmail>                    Adds a user as an owner of a bucket.
  remove-bucket-owner <bucketName> <userEmail>                 Removes a user from the ACL of a bucket.
  add-bucket-default-owner <bucketName> <userEmail>            Adds a user as an owner in the default ACL of a bucket.
  remove-bucket-default-owner <bucketName> <userEmail>         Removes a user from the default ACL of a bucket.
  print-file-acl <bucketName> <fileName>                       Prints the ACL for a file.
  print-file-acl-for-user <bucketName> <fileName> <userEmail>  Prints a user's ACL for a file.
  add-file-owner <bucketName> <fileName> <userEmail>           Adds a user as an owner of a file.
  remove-file-owner <bucketName> <fileName> <userEmail>        Removes a user from the ACL of a file.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node acl print-bucket-acl my-bucket                           Prints the ACL for a bucket named "my-bucket".
  node acl print-bucket-acl-for-user my-bucket bob@company.com  Prints a user's ACL for a bucket named "my-bucket".
  node acl add-bucket-owner my-bucket bob@company.com           Adds "bob@company.com" as an owner of a bucket named
                                                                "my-bucket".
  node acl remove-bucket-owner my-bucket bob@company.com        Removes "bob@company.com" from the ACL of a bucket named
                                                                "my-bucket".
  node acl add-bucket-default-owner my-bucket bob@company.com   Adds "bob@company.com" as an owner in the default ACL of
                                                                a bucket named "my-bucket".
  node acl remove-bucket-default-owner my-bucket                Removes "bob@company.com" from the default ACL of a
  bob@company.com                                               bucket named "my-bucket".
  node acl print-file-acl my-bucket file.txt                    Prints the ACL for a file named "file.txt".
  node acl print-file-acl-for-user my-bucket file.txt           Prints a user's ACL for a file named "file.txt".
  bob@company.com
  node acl add-file-owner my-bucket file.txt bob@company.com    Adds "bob@company.com" as an owner of a file named
                                                                "file.txt".
  node acl remove-file-owner my-bucket file.txt                 Removes "bob@company.com" from the ACL of a file named
  bob@company.com                                               "file.txt".

For more information, see https://cloud.google.com/storage/docs/access-control/create-manage-lists
```

[acl_docs]: https://cloud.google.com/storage/docs/access-control/create-manage-lists
[acl_code]: acl.js

### Buckets

View the [documentation][buckets_docs] or the [source code][buckets_code].

__Usage:__ `node buckets --help`

```
Commands:
  create <bucket>  Creates a new bucket.
  list             Lists all buckets in the current project.
  delete <bucket>  Deletes a bucket.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node buckets create my-bucket  Creates a new bucket named "my-bucket".
  node buckets list              Lists all buckets in the current project.
  node buckets delete my-bucket  Deletes a bucket named "my-bucket".

For more information, see https://cloud.google.com/storage/docs
```

[buckets_docs]: https://cloud.google.com/storage/docs
[buckets_code]: buckets.js

### Encryption

View the [documentation][encryption_docs] or the [source code][encryption_code].

__Usage:__ `node encryption --help`

```
Commands:
  generate-encryption-key                                   Generate a sample encryption key.
  upload <bucketName> <srcFileName> <destFileName> <key>    Encrypts and uploads a file.
  download <bucketName> <srcFileName> <destFileName> <key>  Decrypts and downloads a file.
  rotate <bucketName> <fileName> <oldkey> <newKey>          Rotates encryption keys for a file.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node encryption generate-encryption-key                       Generate a sample encryption key.
  node encryption upload my-bucket ./resources/test.txt         Encrypts and uploads "resources/test.txt" to
  file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q=                     "gs://my-bucket/file_encrypted.txt".
  node encryption download my-bucket file_encrypted.txt         Decrypts and downloads
  ./file.txt QxhqaZEqBGVTW55HhQw9Q=                             "gs://my-bucket/file_encrypted.txt" to "./file.txt".
  node encryption rotate my-bucket file_encrypted.txt           Rotates encryptiong keys for
  QxhqaZEqBGVTW55HhQw9Q= SxafpsdfSDFS89sds9Q=                   "gs://my-bucket/file_encrypted.txt".

For more information, see https://cloud.google.com/storage/docs
```

[encryption_docs]: https://cloud.google.com/storage/docs
[encryption_code]: encryption.js

### Files

View the [documentation][files_docs] or the [source code][files_code].

__Usage:__ `node files --help`

```
Commands:
  list <bucketName> [prefix] [delimiter]                        Lists files in a bucket, optionally filtering by a
                                                                prefix.
  upload <bucketName> <srcFileName>                             Uploads a local file to a bucket.
  download <bucketName> <srcFileName> <destFileName>            Downloads a file from a bucket.
  delete <bucketName> <fileName>                                Deletes a file from a bucket.
  get-metadata <bucketName> <fileName>                          Gets the metadata for a file.
  make-public <bucketName> <fileName>                           Makes a file public.
  generate-signed-url <bucketName> <fileName>                   Generates a signed URL for a file.
  move <bucketName> <srcFileName> <destFileName>                Moves a file to a new location within the same bucket,
                                                                i.e. rename the file.
  copy <srcBucketName> <srcFileName> <destBucketName>           Copies a file in a bucket to another bucket.
  <destFileName>

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node files list my-bucket                                    Lists files in "my-bucket".
  node files list my-bucket public/                            Lists files in "my-bucket" filtered by prefix "public/".
  node files upload my-bucket ./file.txt                       Uploads "./file.txt" to "my-bucket".
  node files download my-bucket file.txt ./file.txt            Downloads "gs://my-bucket/file.txt" to "./file.txt".
  node files delete my-bucket file.txt                         Deletes "gs://my-bucket/file.txt".
  node files get-metadata my-bucket file.txt                   Gets the metadata for "gs://my-bucket/file.txt".
  node files make-public my-bucket file.txt                    Makes "gs://my-bucket/file.txt" public.
  node files move my-bucket file.txt file2.txt                 Renames "gs://my-bucket/file.txt" to
                                                               "gs://my-bucket/file2.txt".
  node files copy my-bucket file.txt my-other-bucket file.txt  Copies "gs://my-bucket/file.txt" to
                                                               "gs://my-other-bucket/file.txt".

For more information, see https://cloud.google.com/storage/docs
```

[files_docs]: https://cloud.google.com/storage/docs
[files_code]: files.js

### Storage Transfer API

View the [documentation][storagetransfer_docs] or the [source code][storagetransfer_code].

__Usage:__ `node transfer --help`

```
Commands:
  jobs <cmd> [args]        Run a job command.
  operations <cmd> [args]  Run an operation command.

Options:
  --help  Show help                                                                        [boolean]

Examples:
  node transfer jobs --help        Show job commands.
  node transfer operations --help  Show operations commands.

For more information, see https://cloud.google.com/storage/transfer
```

__Usage:__ `node transfer jobs --help`

```
transfer jobs <cmd> [args]

Commands:
  create <srcBucket> <destBucket> <time> <date>       Create a transfer job.
  [description]
  get <job>                                           Get a transfer job.
  list                                                List transfer jobs.
  set <job> <field> <value>                           Change the status, description or transferSpec
                                                      of a transfer job.

Options:
  --help  Show help                                                                        [boolean]

Examples:
  node transfer jobs create my-bucket                 Create a transfer job.
  my-other-bucket 2016/08/12 16:30 "Move my files"
  node transfer jobs get                              Get a transfer job.
  transferJobs/123456789012345678
  node transfer jobs list                             List transfer jobs.
  node transfer jobs set                              Update the description for a transfer job.
  transferJobs/123456789012345678 description "My
  new description"
  node transfer jobs set                              Disable a transfer job.
  transferJobs/123456789012345678 status DISABLED
```

__Usage:__ `node transfer operations --help`

```
transfer operations <cmd> [args]

Commands:
  list [job]          List transfer operations, optionally filtering by a job name.
  get <operation>     Get a transfer operation.
  pause <operation>   Pause a transfer operation.
  resume <operation>  Resume a transfer operation.

Options:
  --help  Show help                                                                        [boolean]

Examples:
  node transfer operations list                       List all transfer operations.
  node transfer operations list                       List all transfer operations for a specific
  transferJobs/123456789012345678                     job.
  node transfer operations get                        Get a transfer operation.
  transferOperations/123456789012345678
  node transfer operations pause                      Pause a transfer operation.
  transferOperations/123456789012345678
  node transfer operations resume                     Resume a transfer operation.
  transferOperations/123456789012345678
```

[storagetransfer_docs]: https://cloud.google.com/storage/transfer
[storagetransfer_code]: transfer.js
