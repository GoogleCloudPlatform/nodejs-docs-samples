<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Cloud Storage sample

This recipe demonstrates how to load a file from Cloud Storage.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/gcs

1. Create a Cloud Storage Bucket:

        gsutil mb gs://YOUR_BUCKET_NAME

    * Replace `YOUR_BUCKET_NAME` with the name of your Cloud Storage Bucket.

1. Upload the sample file to the bucket:

        gsutil cp sample.txt gs://YOUR_BUCKET_NAME

    * Replace `YOUR_BUCKET_NAME` with the name of your Cloud Storage Bucket.

1. Deploy the "wordCount" function with an HTTP trigger:

        gcloud functions deploy wordCount --trigger-http

1. Call the "wordCount" function using the sample file:

        gcloud functions call wordCount --data '{"bucket":"YOUR_BUCKET_NAME","file":"sample.txt"}'

    * Replace `YOUR_BUCKET_NAME` with the name of your Cloud Storage Bucket.

    You should see something like this in your console

        The file sample.txt has 114 words

[quickstart]: https://cloud.google.com/functions/quickstart
