<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Hello World sample

This is a basic hello world sample that shows a single exported function.

View the [documentation][docs] or the [source code][code].

[docs]: https://cloud.google.com/functions/writing
[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/module

1. Create a Cloud Storage Bucket to stage our deployment:

        gsutil mb gs://[YOUR_BUCKET_NAME]

    1. Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Deploy the `helloworld` function with an HTTP trigger:

        gcloud alpha functions deploy helloworld --bucket [YOUR_BUCKET_NAME] --trigger-http

    1. Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Call the `helloworld` function:

        gcloud alpha functions call helloworld

    You should see something like this in your console:

        executionId: abcd1234-0
        result: Hello World!

[quickstart]: https://cloud.google.com/functions/quickstart
