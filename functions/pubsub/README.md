<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Pub/Sub sample

This recipe shows you how to publish messages to a Cloud Pub/Sub topic from a
Cloud Function.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide](https://cloud.google.com/functions/quickstart)
to setup Cloud Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/pubsub

1. Create a Cloud Pub/Sub topic (if you already have one you want to use, you
can skip this step):

        gcloud alpha pubsub topics create <your-topic-name>

1. Create a Cloud Storage Bucket to stage our deployment:

        gsutil mb gs://<your-bucket-name>

1. Deploy the "publish" function with an HTTP trigger

        gcloud alpha functions deploy publish --bucket <your-bucket-name> --trigger-http

1. Deploy the "subscribe" function with the Pub/Sub topic as a trigger

        gcloud alpha functions deploy subscribe --bucket <your-bucket-name> --trigger-topic <your-topic-name>

1. Call the "publish" function:

        gcloud alpha functions call publish --data '{"topic":"<your-topic-name>","message":"Hello World!"}'

1. Check the logs for the "subscribe" function:

        gcloud alpha functions get-logs subscribe

You should see something like this in your console
```
D      ... User function triggered, starting execution
I      ... Hello World!
D      ... Execution took 1 ms, user function completed successfully
```
