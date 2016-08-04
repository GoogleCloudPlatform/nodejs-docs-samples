<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Storage Node.js Samples

[Cloud Storage][storage_docs] allows world-wide storage and retrieval of any
amount of data at any time.

[storage_docs]: https://cloud.google.com/storage/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Buckets](#buckets)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Buckets

View the [documentation][buckets_docs] or the [source code][buckets_code].

__Usage:__

```
Usage: node buckets [COMMAND] [ARGS...]

Commands:

  create [BUCKET_NAME]
  list
  delete [BUCKET_NAME]
```

__Create a bucket:__

    node buckets create [BUCKET_NAME]

__List buckets:__

    node buckets list

__Delete a bucket:__

    node buckets delete [BUCKET_NAME]

[buckets_docs]: https://cloud.google.com/storage/docs/json_api/v1/json-api-nodejs-samples
[buckets_code]: buckets.js
