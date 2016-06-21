<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions SendGrid sample

This recipe shows you how to send an email from a Cloud Function using SendGrid.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/sendgrid

1. Create a Sendgrid account. You can either do this manually via the [SendGrid website](https://sendgrid.com/free),
or you can use the [Google Cloud Launcher](https://cloud.google.com/launcher)
which will create an account for you and integrate billing.

    See [Creating a SendGrid account using Cloud Launcher](https://cloud.google.com/launcher/solution/sendgrid-app/sendgrid-email).

1. Create a SendGrid API key:

    1. Log in to your SendGrid account at [https://app.sendgrid.com](https://app.sendgrid.com).
    1. Navigate to "Settings" => "API Keys".
    1. Create a new "General API Key".
    1. Ensure you select (at least) the "Mail Send" permission when you create the API key.
    1. Copy the API Key when it is displayed (you will only see this once, make sure you paste it somewhere!).

1. Create a Cloud Storage bucket to stage your Cloud Functions files, where
`[YOUR_STAGING_BUCKET_NAME]` is a globally-unique bucket name:

        gsutil mb gs://[YOUR_STAGING_BUCKET_NAME]

1. Create a Cloud Storage bucket to upload event `.json` files, where
`[YOUR_EVENT_BUCKET_NAME]` is a globally-unique bucket name:

        gsutil mb gs://[YOUR_EVENT_BUCKET_NAME]

1. Deploy the `sendgridEmail` function with an HTTP trigger, where
`[YOUR_STAGING_BUCKET_NAME]` is the name of your staging bucket:

        gcloud alpha functions deploy sendgridEmail --bucket [YOUR_STAGING_BUCKET_NAME] --trigger-http

1. Deploy the `sendgridWebhook` function with an HTTP trigger, where
`[YOUR_STAGING_BUCKET_NAME]` is the name of your staging bucket:

        gcloud alpha functions deploy sendgridWebhook --bucket [YOUR_STAGING_BUCKET_NAME] --trigger-http

1. Deploy the `sendgridLoad` function with a Cloud Storage trigger, where
`[YOUR_STAGING_BUCKET_NAME]` is the name of your staging bucket and
`[YOUR_EVENT_BUCKET_NAME]` is the name of your bucket for event `.json` files:

        gcloud alpha functions deploy sendgridLoad --bucket [YOUR_STAGING_BUCKET_NAME] --trigger-gs-uri [YOUR_EVENT_BUCKET_NAME]

1. Call the `sendgridEmail` function by making an HTTP request:

        curl -X POST "https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/sendgridEmail?sg_key=[YOUR_API_KEY]" --data '{"to":"[YOUR_RECIPIENT_ADDR]","from":"[YOUR_SENDER_ADDR]","subject":"Hello from Sendgrid!","body":"Hello World!"}'

    * Replace `[YOUR_REGION]` with the region where you function is deployed. This is visible in your terminal when your function finishes deploying.
    * Replace `[YOUR_PROJECT_ID]` with your Cloud project ID. This is visible in your terminal when your function finishes deploying.
    * Replace `[YOUR_SENDGRID_KEY]` with your SendGrid API KEY.
    * Replace `[YOUR_RECIPIENT_ADDR]` with the recipient's email address.
    * Replace `[YOUR_SENDER_ADDR]` with your SendGrid account's email address.

1. Check the logs for the `subscribe` function:

        gcloud alpha functions get-logs sendgridEmail

    You should see something like this in your console:

        D      ... User function triggered, starting execution
        I      ... Sending email...
        D      ... Execution took 1 ms, user function completed successfully

[quickstart]: https://cloud.google.com/functions/quickstart
