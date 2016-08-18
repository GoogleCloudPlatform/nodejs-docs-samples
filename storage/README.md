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
  add <entity> <role>  Add access controls on a bucket or file.
  get [entity]         Get access controls on a bucket or file.
  delete <entity>      Delete access controls from a bucket or file.

Options:
  --bucket, -b   The target storage bucket.           [string] [required]
  --default, -d  Whether to set default access
                 controls. Only valid when setting
                 access controls on a bucket.         [boolean]
  --file, -f     The target file.                     [string]
  --help         Show help                            [boolean]

Examples:
  node acl add user-bob@domain.com OWNER -b mybucket  Add OWNER access controls for
                                                      "user-bob@domain.com" to "mybucket".
  node acl add viewers-2256 WRITER -b mybucket -d     Add default WRITER access controls to
                                                      "mybucket" for "viewers-2256".
  node acl get editors-1234 -b mybucket               Get access controls for "editors-1234" in
                                                      "mybucket".
  node acl delete -b mybucket -f file.txt             Delete all access controls for all entities
                                                      from "file.txt" in "mybucket".

For more information, see https://cloud.google.com/storage/docs/access-control/create-manage-lists
```

[acl_docs]: https://cloud.google.com/storage/docs/access-control/create-manage-lists
[acl_code]: acl.js

### Buckets

View the [documentation][buckets_docs] or the [source code][buckets_code].

__Usage:__ `node buckets --help`

```
Commands:
  create <bucket>  Create a new bucket with the given name.
  list             List all buckets in the authenticated project.
  delete <bucket>  Delete the specified bucket.

Options:
  --help  Show help              [boolean]

Examples:
  node buckets create my-bucket  Create a new bucket named "my-bucket".
  node buckets list              List all buckets in the authenticated project.
  node buckets delete my-bucket  Delete "my-bucket".

For more information, see https://cloud.google.com/storage/docs
```

[buckets_docs]: https://cloud.google.com/storage/docs
[buckets_code]: buckets.js

### Encryption

View the [documentation][encryption_docs] or the [source code][encryption_code].

__Usage:__ `node encryption --help`

```
Commands:
  generate-encryption-key                       Generate a sample encryption key.
  upload <bucket> <srcFile> <destFile> <key>    Upload an encrypted file to a bucket.
  download <bucket> <srcFile> <destFile> <key>  Download an encrypted file from a bucket.
  rotate <bucket> <file> <oldkey> <newKey>      Rotate encryption keys for a file.

Options:
  --help  Show help                                             [boolean]

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

[encryption_docs]: https://cloud.google.com/storage/docs
[encryption_code]: encryption.js

### Files

View the [documentation][files_docs] or the [source code][files_code].

__Usage:__ `node files --help`

```
Commands:
  list <bucket> [options]                             List files in a bucket, optionally filtering
                                                      by a prefix.
  upload <bucket> <srcFile>                           Upload a local file to a bucket.
  download <bucket> <srcFile> <destFile>              Download a file from a bucket.
  delete <bucket> <file>                              Delete a file from a bucket.
  getMetadata <bucket> <file>                         Get metadata for a file in a bucket.
  makePublic <bucket> <file>                          Make a file public in a bucket.
  move <bucket> <srcFile> <destFile>                  Rename a file in a bucket.
  copy <srcBucket> <srcFile> <destBucket> <destFile>  Copy a file in a bucket to another bucket.

Options:
  --help  Show help                                                                        [boolean]

Examples:
  node files list my-bucket                           List files in "my-bucket".
  node files list my-bucket -p public/                List files in "my-bucket" filtered by prefix
                                                      "public/".
  node files upload my-bucket ./file.txt              Upload "./file.txt" to "my-bucket".
  node files download my-bucket file.txt ./file.txt   Download "gs://my-bucket/file.txt" to
                                                      "./file.txt".
  node files delete my-bucket file.txt                Delete "gs://my-bucket/file.txt".
  node files getMetadata my-bucket file.txt           Get metadata for "gs://my-bucket/file.txt".
  node files makePublic my-bucket file.txt            Make "gs://my-bucket/file.txt" public.
  node files move my-bucket file.txt file2.txt        Rename "gs://my-bucket/file.txt" to
                                                      "gs://my-bucket/file2.txt".
  node files copy my-bucket file.txt my-other-bucket  Copy "gs://my-bucket/file.txt" to
  file.txt                                            "gs://my-other-bucket/file.txt".

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
