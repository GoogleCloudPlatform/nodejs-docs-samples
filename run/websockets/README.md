# Node.js WebSockets sample for Cloud Run

This sample demonstrates how to use WebSockets on
[Cloud Run][run] with Node.js.

* [Setup](#setup)
* [Running locally](#running-locally)
* [Deploying to Cloud Run](#deploying-to-Cloud-Run)
* [Running the tests](#running-the-tests)

## Setup

Before you can run or deploy the sample, you need to do the following:

1.  Refer to the [run/README.md][readme] file for instructions on
    running and deploying.
1.  Install dependencies:

    With `npm`:

        npm install

## Running locally

With `npm`:

    npm start

## Deploying to Cloud Run

1. Create a [Redis instance on Cloud Memorystore.](https://cloud.google.com/memorystore/docs/redis/creating-managing-instances) Make sure to choose the VPC network you will use (default). After it’s created, note its IP address.

1. Create a [VPC connector.](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access#creating_a_connector). This will let our Cloud Run service connect to Redis over the VPC network. After it’s created, note its name.

1. Deploy to Cloud Run:
    ```
    export REGION=us-central1
    export CONNECTOR_NAME=<CONNECTOR>
    export REDISHOST=$(gcloud redis instances describe INSTANCE_ID --region REGION --format "value(host)")

    gcloud beta run deploy websockets --source . \
    --allow-unauthenticated \
    --region $REGION \
    --timeout 3600 \
    --vpc-connector $CONNECTOR_NAME \
    --set-env-vars REDISHOST=$REDISHOST
    ```

## Running the tests

See [Contributing][contributing].

[run]: https://cloud.google.com/run/docs
[readme]: ../README.md
[contributing]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/CONTRIBUTING.md

