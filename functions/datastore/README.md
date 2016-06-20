<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Cloud Datastore sample

This recipe shows you how to read and write an entity in Datastore from a Cloud Function.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/datastore

1. Create a Cloud Storage Bucket to stage our deployment:

        gsutil mb gs://[YOUR_BUCKET_NAME]

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Ensure the Cloud Datastore API is enabled:

  [Click here to enable the Cloud Datastore API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com&redirect=https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/functions/datastore)

1. Deploy the "ds-get" function with an HTTP trigger:

        gcloud alpha functions deploy ds-get --bucket [YOUR_BUCKET_NAME] --trigger-http --entry-point get

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Deploy the "ds-set" function with an HTTP trigger:

        gcloud alpha functions deploy ds-set --bucket [YOUR_BUCKET_NAME] --trigger-http --entry-point set

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Deploy the "ds-del" function with an HTTP trigger:

        gcloud alpha functions deploy ds-del --bucket [YOUR_BUCKET_NAME] --trigger-http --entry-point del

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Call the "ds-set" function to create a new entity:

        gcloud alpha functions call ds-set --data '{"kind":"gcf-test","key":"foobar","value":{"message":"Hello World!"}}'

1. Call the "ds-get" function to read the newly created entity:

        gcloud alpha functions call ds-get --data '{"kind":"gcf-test","key":"foobar"}'

1. Call the "ds-del" function to delete the entity:

        gcloud alpha functions call ds-del --data '{"kind":"gcf-test","key":"foobar"}'

1. Call the "ds-get" function again to verify it was deleted:

        gcloud alpha functions call ds-get --data '{"kind":"gcf-test","key":"foobar"}'

[quickstart]: https://cloud.google.com/functions/quickstart
