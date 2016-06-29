# StackDriver Trace sample for Node.js

This sample demonstrates [StackDriver Trace](https://cloud.google.com/trace/) with Node.js.

## Deploy and test

Where appropriate, replace `[YOUR_PROJECT_ID]` with the ID of your Cloud project.

1. `git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git`
1. `cd nodejs-docs-samples/trace`
1. Deploy the app:

    gcloud app deploy

1. Visit the deployed app at https://[YOUR_PROJECT_ID].appspot.com/.
1. Use the [StackDriver Trace dashboard](https://console.cloud.google.com/traces/traces) to inspect recorded traces.
