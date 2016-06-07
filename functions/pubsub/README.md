<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Pub/Sub sample

This recipe shows you how to publish messages to a Cloud Pub/Sub topic from a
Cloud Function. Where applicable, replace `<your-project-id>` with your Cloud
Platform project ID.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide](https://cloud.google.com/functions/quickstart)
to setup Cloud Functions for your project.

2. Clone this repository:

    git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
    cd nodejs-docs-samples/functions/pubsub

3. Create a Cloud Pub/Sub topic (if you already have one you want to use, you
can skip this step):

    gcloud alpha pubsub topics create gcf-recipes-topic

4. Create a Cloud Storage Bucket to stage our deployment:

    gsutil mb gs://<your-project-id>-gcf-recipes-bucket

5. Deploy the "publish" function with an HTTP trigger

    gcloud alpha functions deploy publish --bucket <your-project-id>-gcf-recipes-bucket --trigger-http

6. Deploy the "subscribe" function with the Pub/Sub topic as a trigger

    gcloud alpha functions deploy subscribe --bucket <your-project-id>-gcf-recipes-bucket --trigger-topic gcf-recipes-topic

7. Call the "publish" function:

    gcloud alpha functions call publish --data '{"topic":"gcf-recipes-topic","message":"Hello World!"}'

8. Check the logs for the "subscribe" function:

    gcloud alpha functions get-logs subscribe

You should see something like this in your console
```
D      ... User function triggered, starting execution
I      ... Hello World!
D      ... Execution took 1 ms, user function completed successfully
```
