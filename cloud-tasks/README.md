# [Node.js Cloud Tasks sample for Google App Engine and Cloud Functions][tutorial-link]

This sample shows how to create [Cloud Tasks][cloud-tasks] on
[Google App Engine Standard][gae-std] to trigger a [Cloud Function][cloud-func]
in order to send an postcard email.

* The App Engine application calls the Cloud Tasks API to add a scheduled task to
the queue.

* The queue processes tasks and sends requests to a Cloud Function.

* The Cloud Function calls the SendGrid API to send a postcard email.

[tutorial-link]: https://cloud.google.com/tasks/docs/tutorial-gcf
[cloud-tasks]: https://cloud.google.com/tasks/docs/
[gae-std]: https://cloud.google.com/appengine/docs/standard/nodejs/
[cloud-func]: https://cloud.google.com/functions/

## Setup

Before you can deploy the sample, you will need to do the following:

1. [Enable](https://console.cloud.google.com/flows/enableapi?apiid=cloudfunctions.googleapis.com,cloudtasks.googleapis.com)
  the Cloud Functions and Cloud Tasks APIs in the Google Cloud Platform Console.

1. Install and initialize the [Cloud SDK](https://cloud.google.com/sdk/docs/).

1. Create a [SendGrid account](https://sendgrid.com/free) and generate a
  [SendGrid API key](https://app.sendgrid.com/settings/api_keys).

1. Create a Cloud Tasks queue named `my-queue`:

  ```
  gcloud tasks queues create my-queue
  ```

1. Create a service account in the
  [IAM & admin | Service accounts UI](https://pantheon.corp.google.com/iam-admin/serviceaccounts)
  with the role **Cloud Functions Invoker**.

## Deploying to Cloud Functions

1. Navigate to the `function/` directory:

  ```
  cd function
  ```

1. Deploy the function, replacing `<sendgrid_api_key>` with your key:

  ```
  gcloud functions deploy sendPostcard --runtime nodejs8 --trigger-http --set-env-vars SENDGRID_API_KEY=<sendgrid_api_key>
  ```

1. Restrict requests to your function to only authenticated users:

  * Select function `sendPostcard` in the
    [Cloud Function UI](https://console.cloud.google.com/functions/list). If you
    don't see permissions info for `sendPostcard`, click **SHOW INFO PANEL** in
    the upper right hand corner.

  * Under the **Cloud Functions Invoker** header, delete the member `allUsers`.

  * Click the **Add members** button above.

  * Set **New members** to `allAuthenticatedUsers`.

  * Set the **role** to `Cloud Function Invoker`.

  * Click **SAVE**.

## Deploying to Google App Engine

1. In the `app/` directory, update the values in `app.yaml`:

  ```
  env_variables:
    QUEUE_NAME: "my-queue"
    QUEUE_LOCATION: "us-central1"
    FUNCTION_URL: "https://<region>-<project_id>.cloudfunctions.net/sendPostcard"
    SERVICE_ACCOUNT_EMAIL: "<member>@<project>.iam.gserviceaccount.com"
  ```

  To find your queue location, use the following command:
  ```
  gcloud tasks queues describe my-queue

  name: projects/PROJECT_ID/locations/QUEUE_LOCATION/queues/my-queue
  ```

  To find your function url, use the following command:
  ```
  gcloud functions describe sendPostcard

  httpsTrigger:
    url: https://<region>-<project_id>.cloudfunctions.net/sendPostcard
  ```

1. Deploy the app to the App Engine standard environment:

  ```
  gcloud app deploy
  ```

1. Open the app to send a postcard:

  ```
  gcloud app browse
  ```
