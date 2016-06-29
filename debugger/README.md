# StackDriver Debugger sample for Node.js

This sample demonstrates [StackDriver Debugger](https://cloud.google.com/debugger/) with Node.js.

## Deploy and test

Where appropriate, replace `[YOUR_PROJECT_ID]` with the ID of your Cloud project.

1. `git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git`
1. `cd nodejs-docs-samples/debugger`
1. Initialize a new git repository:

    git init

1. Configure git to use gcloud SDK:

    git config credential.helper gcloud.sh

1. Add your Cloud Source Repository as a git remote:

    git remote add google https://source.developers.google.com/p/[YOUR_PROJECT_ID]/r/default

1. Commit and push the code into the Cloud Source Repository:

    git add -A && git commit -m "Initial commit" && git push --all google

1. Deploy the app:

    gcloud app deploy

1. View the deployed app at https://[YOUR_PROJECT_ID].appspot.com/.
1. Use the [StackDriver Debugger dashboard](https://console.cloud.google.com/debug) to inspect runtime data of the app.
