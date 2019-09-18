# Node.js Cloud Tasks sample for Google App Engine and Cloud Functions

This sample shows how to create [Cloud Tasks](cloud-tasks) on
[Google App Engine Standard](gae-std) to trigger a [Cloud Function](cloud-func)
in order to send an email postcard.

* The App Engine application calls the Cloud Tasks API to add a scheduled task to
the queue.

* The queue processes tasks and sends requests to a Cloud Function.

* The Cloud Function calls the SendGrid API to send an email postcard.

[cloud-tasks]: https://cloud.google.com/tasks/docs/
[gae-std]: https://cloud.google.com/appengine/docs/standard/nodejs/
[cloud-func]: https://cloud.google.com/functions/

## Setup

Before you can deploy the sample, you will need to do the following:

1. Enable the Cloud Function and Cloud Tasks APIs in the
  [Google Cloud Platform Console](https://console.cloud.google.com/apis/library).

1. Install and initialize the [Cloud SDK](https://cloud.google.com/sdk/docs/).

1. Create a [SendGrid account](https://sendgrid.com/free) and generate a
  [SendGrid API key](https://app.sendgrid.com/settings/api_keys).

1. Create a Cloud Tasks queue:

```
gcloud tasks queues create my-queue
```

1. Create a service account in the
  [IAM & Admin UI](https://console.cloud.google.com/iam-admin/iam) with the role
  Cloud Functions Invoker.

## Deploying to Cloud Function

1. To deploy the function with an HTTP trigger, run the following command in
  the `function/` directory replacing `<sendgrid_api_key>` with your key:
```
gcloud functions deploy sendPostcard --runtime nodejs8 --trigger-http --set-env-vars SENDGRID_API_KEY=<sendgrid_api_key>
```

1. Restrict requests to your function to only authenticated users:

  * Select your function in the [Cloud Function UI](https://console.cloud.google.com/functions/list)
    and click “SHOW INFO PANEL” in the upper right hand corner.

  * Under Cloud Functions Invoker header, delete the member `allUsers`.

  * Click “Add members”. Add `allAuthenticatedUsers` with the role
  `Cloud Function Invoker`.

## Deploying to Google App Engine

1. In the `app/` directory, update the values in `app.yaml`:
```
env_variables:
  QUEUE_NAME: "my-queue"
  QUEUE_LOCATION: "us-central1"
  FUNCTION_URL: "https://<region>-<project_id>.cloudfunctions.net/sendPostcard"
  SERVICE_ACCOUNT_EMAIL: "<member>@<project>.iam.gserviceaccount.com"
```
To find these values, use the following commands:
```
gcloud tasks queues describe my-queue
gcloud functions describe sendPostcard
```

1. Deploy the app to App Engine standard environment:
```
gcloud app deploy
```

1. Open the app to send a postcard:
```
gcloud app browse
```
