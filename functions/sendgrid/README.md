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

1. Create a Cloud Storage Bucket to stage our deployment:

        gsutil mb gs://[YOUR_BUCKET_NAME]

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Deploy the `sendEmail` function with an HTTP trigger:

        gcloud alpha functions deploy sendEmail --bucket [YOUR_BUCKET_NAME] --trigger-http

    * Replace `[YOUR_BUCKET_NAME]` with the name of your Cloud Storage Bucket.

1. Call the `sendEmail` function:

        gcloud alpha functions call sendEmail --data '{"sg_key":"[YOUR_SENDGRID_KEY]","to":"[YOUR_RECIPIENT_ADDR]","from":"[YOUR_SENDER_ADDR]","subject":"Hello from Sendgrid!","body":"Hello World!"}'

    * Replace `[YOUR_SENDGRID_KEY]` with your SendGrid API KEY.
    * Replace `[YOUR_RECIPIENT_ADDR]` with the recipient's email address.
    * Replace `[YOUR_SENDER_ADDR]` with your SendGrid account's email address.

1. Check the logs for the `subscribe` function:

        gcloud alpha functions get-logs sendEmail

    You should see something like this in your console:

        D      ... User function triggered, starting execution
        I      ... Sending email to: [YOUR_RECIPIENT_ADDR]
        D      ... Execution took 1 ms, user function completed successfully

[quickstart]: https://cloud.google.com/functions/quickstart
