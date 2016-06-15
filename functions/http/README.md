<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions HTTP sample

This recipe shows you how to respond to HTTP requests with a Cloud Function.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/http

1. Create a Cloud Storage Bucket to stage our deployment:

        gsutil mb gs://[YOUR_BUCKET_NAME]

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Deploy the "helloGET" function with an HTTP trigger

        gcloud alpha functions deploy publish --bucket [YOUR_BUCKET_NAME] --trigger-http

1. Call the "helloGET" function:

        curl https://[YOUR_PROJECT_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/helloGET

[quickstart]: https://cloud.google.com/functions/quickstart
