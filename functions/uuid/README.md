<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions UUID sample

This sample shows a Google Cloud Function that uses a dependency from NPM, and
is a handy way to generate a v4 UUID from the command-line.

View the [documentation][docs] or the [source code][code].

[docs]: https://cloud.google.com/functions/writing
[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/uuid

1. Create a Cloud Storage Bucket to stage our deployment:

        gsutil mb gs://[YOUR_BUCKET_NAME]

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Deploy the `uuid` function with an HTTP trigger:

        gcloud alpha functions deploy uuid --bucket [YOUR_BUCKET_NAME] --trigger-http

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Call the `uuid` function:

        gcloud alpha functions call uuid

    You should see something like this in your console:

        executionId: abcd1234-0
        result: 0ef22088-07f2-44ca-9cef-cea8ff666d69

[quickstart]: https://cloud.google.com/functions/quickstart
