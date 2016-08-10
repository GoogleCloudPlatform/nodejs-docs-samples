<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Storage Node.js Samples

[Cloud Storage][storage_docs] allows world-wide storage and retrieval of any
amount of data at any time.

[storage_docs]: https://cloud.google.com/storage/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Buckets](#buckets)
  * [Files](#files)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Buckets

View the [documentation][buckets_docs] or the [source code][buckets_code].

__Usage:__ `node buckets --help`

```
Usage: node buckets COMMAND [ARGS...]

Commands:

  create BUCKET_NAME
  list
  delete BUCKET_NAME

Examples:

  node buckets create my-bucket
  node buckets list
  node buckets delete my-bucket
```

[buckets_docs]: https://cloud.google.com/storage/docs
[buckets_code]: buckets.js

### Files

View the [documentation][files_docs] or the [source code][files_code].

__Usage:__ `node files --help`

```
Usage: node files COMMAND [ARGS...]

Commands:

  list BUCKET_NAME
  listByPrefix BUCKET_NAME PREFIX [DELIMITER]
  upload BUCKET_NAME FILE_NAME
  download BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME
  delete BUCKET_NAME FILE_NAME
  getMetadata BUCKET_NAME FILE_NAME
  makePublic BUCKET_NAME FILE_NAME
  move BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME
  copy BUCKET_NAME SRC_FILE_NAME DEST_BUCKET_NAME DEST_FILE_NAME

Examples:

  list my-bucket
  listByPrefix my-bucket /some-folder
  listByPrefix my-bucket /some-folder -
  upload my-bucket ./file.txt
  download my-bucket file.txt ./file.txt
  delete my-bucket file.txt
  getMetadata my-bucket file.txt
  makePublic my-bucket file.txt
  move my-bucket file.txt file2.txt
  copy my-bucket file.txt my-other-bucket file.txt
```

[files_docs]: https://cloud.google.com/storage/docs
[files_code]: files.js

### Encryption

View the [documentation][encryption_docs] or the [source code][encryption_code].

__Usage:__ `node encryption --help`

```
Usage: node encryption COMMAND [ARGS...]

Commands:

  generate-encryption-key
  upload BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME KEY
  download BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME KEY
  rotate BUCKET_NAME FILE_NAME OLD_KEY NEW_KEY

Examples:

  node encryption generate-encryption-key
  node encryption upload my-bucket resources/test.txt file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q=
  node encryption download my-bucket file_encrypted.txt ./file.txt QxhqaZEqBGVTW55HhQw9Q=
  node encryption rotate my-bucket file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q= SxafpsdfSDFS89sds9Q=
```

[encryption_docs]: https://cloud.google.com/storage/docs
[encryption_code]: encryption.js
