# Events for Cloud Run on Anthos – Pub/Sub tutorial

This sample shows how to create a service that processes Pub/Sub messages. It is
assumed that you already created a GKE cluster with Events for Cloud Run already
installed.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

## Dependencies

* **express**: Web server framework.
* **mocha**: [development] Test running framework.
* **supertest**: [development] HTTP assertion test client.

## Quickstart

Set cluster name, location and platform:

```sh
gcloud config set run/cluster events-cluster
gcloud config set run/cluster_location europe-west1-b
gcloud config set run/platform gke
```

Create a Cloud Pub/Sub topic:

```sh
gcloud pubsub topics create my-topic
```

Create a Cloud Pub/Sub trigger:

```sh
gcloud alpha events triggers create pubsub-trigger \
--source CloudPubSubSource \
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
