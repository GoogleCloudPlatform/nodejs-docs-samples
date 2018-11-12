# StackDriver Debugger sample for Node.js

This sample demonstrates [StackDriver Debugger][debugger] with Node.js.

* [Setup](#setup)
* [Running locally](#running-locally)
* [Deploying to App Engine](#deploying-to-app-engine)
* [Running the tests](#running-the-tests)

## Setup

Before you can run or deploy the sample, you need to do the following (where
appropriate, replace `YOUR_PROJECT_ID` with the ID of your Cloud project):

1.  Refer to the [appengine/README.md][readme] file for instructions on
    running and deploying.

1. Set the `GCLOUD_PROJECT` environment variable:

    Linux:

        export GCLOUD_PROJECT=your-project-id

    Windows:

        set GCLOUD_PROJECT=your-project-id

    Windows (PowerShell):

        $env:GCLOUD_PROJECT="your-project-id"

1.  Acquire local credentials for authenticating with Google Cloud Platform APIs:

        gcloud auth application-default login

1.  Configure git to use gcloud SDK:

        git config credential.helper gcloud.sh

1.  Add your Cloud Source Repository as a git remote:

        git remote add google https://source.developers.google.com/p/YOUR_PROJECT_ID/r/default

1.  Commit and push the code into the Cloud Source Repository:

        git add -A && git commit -m "Initial commit" && git push --all google

1.  Install dependencies:

        npm install

## Running locally

    npm start


## Deploying to App Engine

    npm run deploy


Use the [Stackdriver Debugger dashboard](https://console.cloud.google.com/debug) to inspect runtime data of the app.

## Running the tests

See [Contributing][contributing].

[debugger]: https://cloud.google.com/debugger/
[readme]: ../README.md
[contributing]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/CONTRIBUTING.md
