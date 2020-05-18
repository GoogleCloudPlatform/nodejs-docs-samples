# Events for Cloud Run – Pub/Sub tutorial

This sample shows how to create a service that processes Pub/Sub messages.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

## Dependencies

* **express**: Web server framework.
* **body-parser**: express middleware for request payload processing.
* **mocha**: [development] Test running framework.
* **supertest**: [development] HTTP assertion test client.

## Quickstart

```sh
gcloud pubsub topics create my-topic

gcloud alpha events triggers create pubsub-trigger \
--target-service cloudrun-events \
--type com.google.cloud.pubsub.topic.publish \
--parameters topic=my-topic

gcloud builds submit \
 --tag gcr.io/$(gcloud config get-value project)/"$MY_RUN_CONTAINER"
gcloud run deploy "$MY_RUN_SERVICE" \
 --image gcr.io/$(gcloud config get-value project)/"$MY_RUN_CONTAINER" \
 --allow-unauthenticated # Note: The "allowed unauthenticated requests" flag is not needed in production.
 ```

 Test:

 ```
 gcloud pubsub topics publish my-topic --message="Hello there"
 ```