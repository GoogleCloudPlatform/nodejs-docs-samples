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
  * [Storage Transfer API (Jobs)](#storage-transfer-api-jobs)
  * [Storage Transfer API (Operations)](#storage-transfer-api-operations)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### ACL (Access Control Lists)

View the [documentation][acl_0_docs] or the [source code][acl_0_code].

__Usage:__ `node acl --help`

```
Commands:
  add <entity> <role>  Add access controls on a bucket or file.
  get [entity]         Get access controls on a bucket or file.
  delete <entity>      Delete access controls from a bucket or file.

Options:
  --bucket, -b   The target storage bucket.                                                          [string] [required]
  --default, -d  Whether to set default access controls. Only valid when setting access controls on a bucket.  [boolean]
  --file, -f     The target file.                                                                               [string]
  --help         Show help                                                                                     [boolean]

Examples:
  node acl add user-bob@domain.com OWNER -b mybucket  Add OWNER access controls for "user-bob@domain.com" to "mybucket".
  node acl add viewers-2256 WRITER -b mybucket -d     Add default WRITER access controls to "mybucket" for
                                                      "viewers-2256".
  node acl get editors-1234 -b mybucket               Get access controls for "editors-1234" in "mybucket".
  node acl delete -b mybucket -f file.txt             Delete all access controls for all entities from "file.txt" in
                                                      "mybucket".

For more information, see https://cloud.google.com/storage/docs/access-control/create-manage-lists
```

[acl_0_docs]: https://cloud.google.com/storage/docs/access-control/create-manage-lists
[acl_0_code]: acl.js

### Buckets

View the [documentation][buckets_1_docs] or the [source code][buckets_1_code].

__Usage:__ `node buckets --help`

```
Commands:
  create <bucket>  Create a new bucket with the given name.
  list             List all buckets in the authenticated project.
  delete <bucket>  Delete the specified bucket.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node buckets create my-bucket  Create a new bucket named "my-bucket".
  node buckets list              List all buckets in the authenticated project.
  node buckets delete my-bucket  Delete "my-bucket".

For more information, see https://cloud.google.com/storage/docs
```

[buckets_1_docs]: https://cloud.google.com/storage/docs
[buckets_1_code]: buckets.js

### Encryption

View the [documentation][encryption_2_docs] or the [source code][encryption_2_code].

__Usage:__ `node encryption --help`

```
Commands:
  generate-encryption-key                       Generate a sample encryption key.
  upload <bucket> <srcFile> <destFile> <key>    Upload an encrypted file to a bucket.
  download <bucket> <srcFile> <destFile> <key>  Download an encrypted file from a bucket.
  rotate <bucket> <file> <oldkey> <newKey>      Rotate encryption keys for a file.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node encryption generate-encryption-key                       Generate a sample encryption key.
  node encryption upload my-bucket resources/test.txt           Upload "resources/test.txt" to
  file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q=                     "gs://my-bucket/file_encrypted.txt".
  node encryption download my-bucket file_encrypted.txt         Download "gs://my-bucket/file_encrypted.txt" to
  ./file.txt QxhqaZEqBGVTW55HhQw9Q=                             "./file.txt".
  node encryption rotate my-bucket file_encrypted.txt           Rotate encryptiong keys for
  QxhqaZEqBGVTW55HhQw9Q= SxafpsdfSDFS89sds9Q=                   "gs://my-bucket/file_encrypted.txt".

For more information, see https://cloud.google.com/storage/docs
```

[encryption_2_docs]: https://cloud.google.com/storage/docs
[encryption_2_code]: encryption.js

### Files

View the [documentation][files_3_docs] or the [source code][files_3_code].

__Usage:__ `node files --help`

```
Commands:
  list <bucket> [options]                             List files in a bucket, optionally filtering by a prefix.
  upload <bucket> <srcFile>                           Upload a local file to a bucket.
  download <bucket> <srcFile> <destFile>              Download a file from a bucket.
  delete <bucket> <file>                              Delete a file from a bucket.
  getMetadata <bucket> <file>                         Get metadata for a file in a bucket.
  makePublic <bucket> <file>                          Make a file public in a bucket.
  move <bucket> <srcFile> <destFile>                  Move a file to a new location within the same bucket, i.e. rename
                                                      the file.
  copy <srcBucket> <srcFile> <destBucket> <destFile>  Copy a file in a bucket to another bucket.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node files list my-bucket                                    List files in "my-bucket".
  node files list my-bucket -p public/                         List files in "my-bucket" filtered by prefix "public/".
  node files upload my-bucket ./file.txt                       Upload "./file.txt" to "my-bucket".
  node files download my-bucket file.txt ./file.txt            Download "gs://my-bucket/file.txt" to "./file.txt".
  node files delete my-bucket file.txt                         Delete "gs://my-bucket/file.txt".
  node files getMetadata my-bucket file.txt                    Get metadata for "gs://my-bucket/file.txt".
  node files makePublic my-bucket file.txt                     Make "gs://my-bucket/file.txt" public.
  node files move my-bucket file.txt file2.txt                 Rename "gs://my-bucket/file.txt" to
                                                               "gs://my-bucket/file2.txt".
  node files copy my-bucket file.txt my-other-bucket file.txt  Copy "gs://my-bucket/file.txt" to
                                                               "gs://my-other-bucket/file.txt".

For more information, see https://cloud.google.com/storage/docs
```

[files_3_docs]: https://cloud.google.com/storage/docs
[files_3_code]: files.js

### Storage Transfer API (Jobs)

View the [documentation][transfer_4_docs] or the [source code][transfer_4_code].

__Usage:__ `node transfer jobs --help`

```
transfer jobs <cmd> [args]

Commands:
  create <srcBucket> <destBucket> <time> <date> [description]  Create a transfer job.
  get <job>                                                    Get a transfer job.
  list                                                         List transfer jobs.
  set <job> <field> <value>                                    Change the status, description or transferSpec of a
                                                               transfer job.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node transfer jobs create my-bucket my-other-bucket           Create a transfer job.
  2016/08/12 16:30 "Move my files"
  node transfer jobs get transferJobs/123456789012345678        Get a transfer job.
  node transfer jobs list                                       List transfer jobs.
  node transfer jobs set transferJobs/123456789012345678        Update the description for a transfer job.
  description "My new description"
  node transfer jobs set transferJobs/123456789012345678        Disable a transfer job.
  status DISABLED

For more information, see https://cloud.google.com/storage/transfer
```

[transfer_4_docs]: https://cloud.google.com/storage/transfer
[transfer_4_code]: transfer.js

### Storage Transfer API (Operations)

View the [documentation][transfer_5_docs] or the [source code][transfer_5_code].

__Usage:__ `node transfer operations --help`

```
transfer operations <cmd> [args]

Commands:
  list [job]          List transfer operations, optionally filtering by a job name.
  get <operation>     Get a transfer operation.
  pause <operation>   Pause a transfer operation.
  resume <operation>  Resume a transfer operation.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node transfer operations list                                 List all transfer operations.
  node transfer operations list                                 List all transfer operations for a specific job.
  transferJobs/123456789012345678
  node transfer operations get                                  Get a transfer operation.
  transferOperations/123456789012345678
  node transfer operations pause                                Pause a transfer operation.
  transferOperations/123456789012345678
  node transfer operations resume                               Resume a transfer operation.
  transferOperations/123456789012345678

For more information, see https://cloud.google.com/storage/transfer
```

[transfer_5_docs]: https://cloud.google.com/storage/transfer
[transfer_5_code]: transfer.js
