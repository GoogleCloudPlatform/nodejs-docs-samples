<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Cloud Datastore sample

This recipe shows you how to read and write an entity in Cloud Datastore from a
Cloud Function.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/datastore

1. Ensure the Cloud Datastore API is enabled:

  [Click here to enable the Cloud Datastore API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com&redirect=https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/functions/datastore)

1. Deploy the "get" function with an HTTP trigger:

        gcloud beta functions deploy get --trigger-http

1. Deploy the "set" function with an HTTP trigger:

        gcloud beta functions deploy set --trigger-http

1. Deploy the "del" function with an HTTP trigger:

        gcloud beta functions deploy del --trigger-http

1. Call the "set" function to create a new entity:

        gcloud beta functions call set --data '{"kind":"Task","key":"sampletask1","value":{"description":"Buy milk"}}'

    or

        curl -H "Content-Type: application/json" -X POST -d '{"kind":"Task","key":"sampletask1","value":{"description":"Buy milk"}}' "https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/set"

    * Replace `[YOUR_REGION]` with the region where your function is deployed.
    * Replace `[YOUR_PROJECT_ID]` with your Google Cloud Platform project ID.

1. Call the "get" function to read the newly created entity:

        gcloud beta functions call get --data '{"kind":"Task","key":"sampletask1"}'

    or

        curl -H "Content-Type: application/json" -X POST -d '{"kind":"Task","key":"sampletask1"}' "https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/get"

    * Replace `[YOUR_REGION]` with the region where your function is deployed.
    * Replace `[YOUR_PROJECT_ID]` with your Google Cloud Platform project ID.

1. Call the "del" function to delete the entity:

        gcloud alpha functions call del --data '{"kind":"Task","key":"sampletask1"}'

    or

        curl -H "Content-Type: application/json" -X POST -d '{"kind":"Task","key":"sampletask1"}' "https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/del"

    * Replace `[YOUR_REGION]` with the region where your function is deployed.
    * Replace `[YOUR_PROJECT_ID]` with your Google Cloud Platform project ID.

1. Call the "get" function again to verify it was deleted:

        gcloud beta functions call get --data '{"kind":"Task","key":"sampletask1"}'

    or

        curl -H "Content-Type: application/json" -X POST -d '{"kind":"Task","key":"sampletask1"}' "https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/get"

    * Replace `[YOUR_REGION]` with the region where your function is deployed.
    * Replace `[YOUR_PROJECT_ID]` with your Google Cloud Platform project ID.


[quickstart]: https://cloud.google.com/functions/quickstart
