<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Storage Transfer API Node.js Samples

[![Build](https://storage.googleapis.com/cloud-docs-samples-badges/GoogleCloudPlatform/nodejs-docs-samples/nodejs-docs-samples-storage-transfer.svg)]()

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Storage Transfer API](#storage-transfer-api)
* [Running the tests](#running-the-tests)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

        npm install


[prereq]: ../README.md#prerequisites
[run]: ../README.md#how-to-run-a-sample

## Samples

### Storage Transfer API

View the [documentation][transfer_0_docs] or the [source code][transfer_0_code].

__Usage:__ `node transfer.js --help`

```
Commands:
  jobs <cmd> [args]        Run a job command.
  operations <cmd> [args]  Run an operation command.

Options:
  --help  Show help                                                                        [boolean]

Examples:
  node transfer.js jobs --help        Show job commands.
  node transfer.js operations --help  Show operations commands.

For more information, see https://cloud.google.com/storage/transfer
```

[transfer_0_docs]: https://cloud.google.com/storage/transfer
[transfer_0_code]: transfer.js

## Running the tests

1.  Set the **GCLOUD_PROJECT** and **GOOGLE_APPLICATION_CREDENTIALS** environment variables.

1.  Run the tests:

        npm test