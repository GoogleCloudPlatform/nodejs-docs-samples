# Node.js Cloud Pub/Sub sample for Google App Engine

This sample shows how to send and receive messages using [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) on [Google App Engine](https://cloud.google.com/appengine)
[standard environment](https://cloud.google.com/appengine/docs/standard/nodejs)
and [flexible environment](https://cloud.google.com/appengine/docs/flexible/nodejs).

## Setup

Before you can run or deploy the sample, you will need to do the following:

1. Enable the Cloud Pub/Sub API in the [Google Developers Console](https://console.developers.google.com/project/_/apiui/apiview/pubsub/overview).
1. Create a topic and subscription.

        gcloud beta pubsub topics create <your-topic-name>
        gcloud beta pubsub subscriptions create <your-subscription-name> \
          --topic <your-topic-name> \
          --push-endpoint \
            https://<your-project-id>.appspot.com/pubsub/push?token=<your-verification-token> \
          --ack-deadline 30

1. Update the environment variables in `app.standard.yaml` or `app.flexible.yaml`
(depending on your App Engine environment).

## Running locally

Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

When running locally, you can use the [Google Cloud SDK](https://cloud.google.com/sdk)
to provide authentication to use Google Cloud APIs:

    gcloud init

Then set environment variables before starting your application:

    export PUBSUB_VERIFICATION_TOKEN=<your-verification-token>
    export PUBSUB_TOPIC=<your-topic-name>
    npm start

### Simulating push notifications

The application can send messages locally, but it is not able to receive push
messages locally. You can, however, simulate a push message by making an HTTP
request to the local push notification endpoint. There is an included
`sample_message.json`. You can use `curl` or [httpie](https://github.com/jkbrzt/httpie)
to POST this:

    curl -H "Content-Type: application/json" -i --data @sample_message.json ":8080/pubsub/push?token=<your-verification-token>"

Or

    http POST ":8080/pubsub/push?token=<your-verification-token>" < sample_message.json

Response:

    HTTP/1.1 200 OK
    Connection: keep-alive
    Date: Mon, 31 Aug 2015 22:19:50 GMT
    Transfer-Encoding: chunked
    X-Powered-By: Express

After the request completes, you can refresh `localhost:8080` and see the
message in the list of received messages.
