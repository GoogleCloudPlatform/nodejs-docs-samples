<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions message sample

This sample shows writing to logs in a Cloud Function.

View the [documentation][docs] or the [source code][source].

[docs]: index.js
[source]: https://cloud.google.com/functions/walkthroughs

## Deploy

This example deploys the function with an HTTP trigger.

    gcloud alpha functions deploy helloworld --bucket <your-bucket-name> --trigger-http

## Test

    gcloud alpha functions call helloworld

You can also use `curl` to trigger the function:

    curl -X POST https://<your-project-region>.<your-project-id>.cloudfunctions.net/helloworld
