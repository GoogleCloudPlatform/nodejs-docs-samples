<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions message sample #2

This sample shows writing to logs in a Cloud Function.

View the [documentation][docs] or the [source code][code].

[docs]: https://cloud.google.com/functions/walkthroughs
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

        gcloud alpha functions call helloworld --data '{"message":"Hello World!"}'

1. Check the logs for the `helloworld` function:

        gcloud alpha functions get-logs helloworld

    You should see something like this in your console:

        D      ... User function triggered, starting execution
        I      ... My GCF Function: Hello World!
        D      ... Execution took 1 ms, user function completed successfully

[quickstart]: https://cloud.google.com/functions/quickstart

