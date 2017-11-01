# Node.js Google Cloud Tasks sample for Google App Engine

This sample demonstrates how to use [Google Cloud Tasks](https://cloud.google.com/cloud-tasks/)
on [Google App Engine Flexible Environment](https://cloud.google.com/appengine/docs/flexible/nodejs).

App Engine queues push tasks to an App Engine HTTP target. This directory
contains both the App Engine app to deploy, as well as the snippets to run
locally to push tasks to it, which could also be called on App Engine.

`createTask.js` is a simple command-line program to create tasks to be pushed to
the App Engine app.

`server.js` is the main App Engine app. This app serves as an endpoint to
receive App Engine task attempts.

`app.yaml` configures the App Engine app.

* [Setup](#setup)
* [Running locally](#running-locally)
* [Deploying to App Engine](#deploying-to-app-engine)
* [Running the tests](#running-the-tests)

## Setup

Before you can run or deploy the sample, you need to do the following:

1.  Refer to the [appengine/README.md][readme] file for instructions on
    running and deploying.
1.  Enable the Cloud Tasks API in the [Google Cloud Console](https://cloud.google.com/apis/library/cloudtasks.googleapis.com).
1.  Install dependencies:

    With `npm`:

        npm install

    or with `yarn`:

        yarn install

## Creating a queue

To create a queue using the Cloud SDK, use the following gcloud command:

    gcloud alpha tasks queues create-app-engine-queue my-appengine-queue

Note: A newly created queue will route to the default App Engine service and
version unless configured to do otherwise. Read the online help for the
`create-app-engine-queue` or the `update-app-engine-queue` commands to learn
about routing overrides for App Engine queues.

## Deploying the App Engine app

Deploy the App Engine app with gcloud:

    gcloud app deploy

Verify the index page is serving:

    gcloud app browse

The App Engine app serves as a target for the push requests. It has an
endpoint `/log_payload` that reads the payload (i.e., the request body) of the
HTTP POST request and logs it. The log output can be viewed with:

    gcloud app logs read

## Running the Samples

To get usage information: `node createTask.js --help`

Which prints:

```
Options:
  --version        Show version number                                                                         [boolean]
  --location, -l   Location of the queue to add the task to.                                         [string] [required]
  --queue, -q      ID (short name) of the queue to add the task to.                                  [string] [required]
  --project, -p    Project of the queue to add the task to.                                          [string] [required]
  --payload, -d    (Optional) Payload to attach to the push queue.                                              [string]
  --inSeconds, -s  (Optional) The number of seconds from now to schedule task attempt.                          [number]
  --help           Show help                                                                                   [boolean]

Examples:
  node createTask.js --project my-project-id

For more information, see https://cloud.google.com/cloud-tasks
```
