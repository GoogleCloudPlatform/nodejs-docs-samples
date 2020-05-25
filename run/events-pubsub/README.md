# Events for Cloud Run – Pub/Sub tutorial

This sample shows how to create a service that processes Pub/Sub messages.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

## Dependencies

* **express**: Web server framework.
* **mocha**: [development] Test running framework.
* **supertest**: [development] HTTP assertion test client.

## Quickstart

Create a Cloud Pub/Sub topic:

```sh
gcloud pubsub topics create my-topic
```

Create a Cloud Pub/Sub trigger:

```sh
gcloud alpha events triggers create pubsub-trigger \
--target-service cloudrun-events-pubsub \
--type com.google.cloud.pubsub.topic.publish \
--parameters topic=my-topic
```

Deploy your Cloud Run service:

```sh
gcloud builds submit \
 --tag gcr.io/$(gcloud config get-value project)/cloudrun-events-pubsub
gcloud run deploy cloudrun-events-pubsub \
 --image gcr.io/$(gcloud config get-value project)/cloudrun-events-pubsub
 ```

## Test

Test your Cloud Run service by publishing a message to the topic: 

```sh
gcloud pubsub topics publish my-topic --message="Hello there"
```

You may observe the Run service receiving an event in Cloud Logging.
