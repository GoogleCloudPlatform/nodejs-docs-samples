# Stackdriver Trace sample for Node.js

This sample demonstrates [StackDriver Trace][trace] with Node.js.

* [Setup](#setup)
* [Running locally](#running-locally)
* [Deploying to App Engine](#deploying-to-app-engine)
* [Running the tests](#running-the-tests)

## Setup

Before you can run or deploy the sample, you need to do the following:

1.  Refer to the [appengine/README.md][readme] file for instructions on
    running and deploying.
1.  [Create a Google Analytics Property and obtain the Tracking ID][tracking].
1.  Add your tracking ID to `app.yaml`.
1.  Install dependencies:

        npm install

## Running locally

    npm start

## Deploying to App Engine

    npm run deploy

Use the [Stackdriver Trace dashboard](https://console.cloud.google.com/traces/traces) to inspect recorded traces.

## Running the tests

See [Contributing][contributing].

[trace]: https://cloud.google.com/trace/
[readme]: ../README.md
[contributing]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/CONTRIBUTING.md
