# Events for Cloud Run – Cloud Storage Event tutorial

This sample shows how to create a service that processes Cloud Storage events.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

## Dependencies

* **express**: Web server framework.
* **mocha**: [development] Test running framework.
* **supertest**: [development] HTTP assertion test client.

## Quickstart

Create a _single region_ Cloud Storage bucket:

```sh
MY_GCS_BUCKET=single-region-bucket
gsutil mb -p $(gcloud config get-value project) -l us-central1 gs://"$MY_GCS_BUCKET"
```

Create a Cloud Storage (via Audit Log) trigger:

```sh
gcloud alpha events triggers create my-gcs-trigger \
--target-service cloudrun-events-storage \
--type com.google.cloud.auditlog.event \
--parameters methodName=storage.buckets.update \
--parameters serviceName=storage.googleapis.com \
--parameters resourceName=projects/_/buckets/"$MY_GCS_BUCKET" # resourceName is optional.
```

## Test

Test your Cloud Run service by creating a GCS event:

```sh
gsutil defstorageclass set NEARLINE gs://$MY_GCS_BUCKET
```

You may observe the Run service receiving an event in Cloud Logging.