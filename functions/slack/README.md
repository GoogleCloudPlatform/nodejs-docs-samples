<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Slack Slash Command sample

This tutorial demonstrates using Cloud Functions to implement a Slack Slash
Command that searches the Google Knowledge Graph API.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/sendgrid

1. Create or join a Slack community.

    See [Creating a Slack community](TODO).

1. Create a Slash Command:

    See [Creating a Slash Command](TODO).

1. Create a Cloud Storage bucket to stage your Cloud Functions files, where
`[YOUR_STAGING_BUCKET_NAME]` is a globally-unique bucket name:

        gsutil mb gs://[YOUR_STAGING_BUCKET_NAME]

1. Deploy the `kgSearch` function with an HTTP trigger, where
`[YOUR_STAGING_BUCKET_NAME]` is the name of your staging bucket:

        gcloud alpha functions deploy kgSearch --bucket [YOUR_STAGING_BUCKET_NAME] --trigger-http

1. Call the `kgSearch` function by making an HTTP request:

        curl -X POST "https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/kgSearch" --data '{"token":"[YOUR_SLACK_TOKEN]","text":"giraffe"}'

    * Replace `[YOUR_REGION]` with the region where you function is deployed. This is visible in your terminal when your function finishes deploying.
    * Replace `[YOUR_PROJECT_ID]` with your Cloud project ID. This is visible in your terminal when your function finishes deploying.
    * `[YOUR_SLACK_TOKEN]` is the token provided by Slack in the configured Slash Command.

1. Check the logs for the `subscribe` function:

        gcloud alpha functions get-logs kgSearch

    You should see something like this in your console:

        D      ... User function triggered, starting execution
        D      ... Execution took 1 ms, user function completed successfully

[quickstart]: https://cloud.google.com/functions/quickstart
