<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Pub/Sub sample

This recipe shows you how to publish messages to a Cloud Pub/Sub topic from a
Cloud Function.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/pubsub

1. Create a Cloud Pub/Sub topic (if you already have one you want to use, you
can skip this step):

        gcloud beta pubsub topics create YOUR_TOPIC_NAME

    * Replace `YOUR_TOPIC_NAME` with the name of your Pub/Sub Topic.

1. Deploy the `publish` function with an HTTP trigger:

        gcloud functions deploy publish --trigger-http

1. Deploy the `subscribe` function with the Pub/Sub topic as a trigger:

        gcloud functions deploy subscribe --trigger-topic YOUR_TOPIC_NAME

    * Replace `YOUR_TOPIC_NAME` with the name of your Pub/Sub Topic.

1. Call the `publish` function:

        gcloud functions call publish --data '{"topic":"YOUR_TOPIC_NAME","message":"Hello World!"}'

    * Replace `YOUR_TOPIC_NAME` with the name of your Pub/Sub Topic.

1. Check the logs for the `subscribe` function:

        gcloud alpha functions get-logs subscribe

    You should see something like this in your console:

        D      ... User function triggered, starting execution
        I      ... Hello World!
        D      ... Execution took 1 ms, user function completed successfully

[quickstart]: https://cloud.google.com/functions/quickstart
