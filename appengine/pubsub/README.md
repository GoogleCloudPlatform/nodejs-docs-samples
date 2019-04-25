# Node.js Cloud Pub/Sub sample for Google App Engine

This sample shows how to send and receive messages using [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) on [Google App Engine](https://cloud.google.com/appengine)
[standard environment](https://cloud.google.com/appengine/docs/standard/nodejs)
and [flexible environment](https://cloud.google.com/appengine/docs/flexible/nodejs).

## Setup

Before you can run or deploy the sample, you will need to do the following:

1. Enable the Cloud Pub/Sub API in the [Google Developers Console](https://console.developers.google.com/project/_/apiui/apiview/pubsub/overview).
1. Create a topic and subscription.

        gcloud pubsub topics create <your-topic-name>
        gcloud pubsub subscriptions create <your-subscription-name> \
          --topic <your-topic-name> \
          --push-endpoint \
            https://<your-project-id>.appspot.com/pubsub/push?token=<your-verification-token> \
          --ack-deadline 30

1. Create a subscription for authenticated pushes. The push auth service account must have Service Account Token Creator Role assigned, which can be done in the Cloud Console [IAM & admin](https://console.cloud.google.com/iam-admin/iam) UI. `--push-auth-token-audience` is optional. If set, remember to modify the audience field check in `app.js` (line 112).

        gcloud beta pubsub subscriptions create <your-subscription-name> \
          --topic <your-topic-name> \
          --push-endpoint \
            https://<your-project-id>.appspot.com/pubsub/authenticated-push?token=<your-verification-token> \
          --ack-deadline 30 \
          --push-auth-service-account=[your-service-account-email] \
          --push-auth-token-audience=example.com

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

### Authenticated push notifications

Simulating authenticated push requests will fail because requests need to contain a Cloud Pub/Sub-generated JWT in the "Authorization" header.

    http POST ":8080/pubsub/authenticated-push?token=<your-verification-token>" < sample_message.json

Response:

    HTTP/1.1 400 Bad Request
    Connection: keep-alive
    Date: Thu, 25 Apr 2019 17:47:36 GMT
    Transfer-Encoding: chunked
    X-Powered-By: Express

    Invalid token

## Running on App Engine

Note: Not all the files in the current directory are needed to run your code on App Engine. Specifically, the `test` directory, which is for testing purposes only. It SHOULD NOT be included in when deploying your app. When your app is up and running, Cloud Pub/Sub creates tokens using a private key, then the Google Auth Node.js library takes care of verifying and decoding the token using Google's public certs, to confirm that the push requests indeed come from Cloud Pub/Sub.

In the current directory, deploy using `gcloud`:

        gcloud app deploy app.standard.yaml

To deploy to App Engine Node.js Flexible Environment, run

        gcloud app deploy app.flexible.yaml

You can now access the application at https://[your-app-id].appspot.com. You can use the form to submit messages, but it's non-deterministic which instance of your application will receive the notification. You can send multiple messages and refresh the page to see the received message.
