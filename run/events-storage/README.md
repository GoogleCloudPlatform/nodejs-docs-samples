# Events for Cloud Run – Cloud Storage tutorial

This sample shows how to create a service that processes Cloud Storage events.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

## Dependencies

* **express**: Web server framework.
* **body-parser**: express middleware for request payload processing.
* **mocha**: [development] Test running framework.
* **supertest**: [development] HTTP assertion test client.

## Quickstart

```sh
# Create Trigger
gcloud alpha events triggers create my-gcs-trigger \
 --target-service "$MY_RUN_SERVICE" \
 --type com.google.cloud.auditlog.event \
 --parameters methodName=storage.buckets.update \
 --parameters serviceName=storage.googleapis.com \
 --parameters resourceName=projects/_/buckets/"$MY_GCS_BUCKET" # resourceName is optional.
```

```sh
gcloud builds submit \
 --tag gcr.io/$(gcloud config get-value project)/"$MY_RUN_CONTAINER"
gcloud run deploy "$MY_RUN_SERVICE" \
 --image gcr.io/$(gcloud config get-value project)/"$MY_RUN_CONTAINER"
 ```