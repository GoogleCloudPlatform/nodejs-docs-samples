# Node.js Cloud Datastore sample for Google App Engine

This sample demonstrates how to use [Cloud Datastore](https://cloud.google.com/datastore/)
on [Google App Engine Managed VMs](https://cloud.google.com/appengine).

## Setup

Before you can run or deploy the sample, you will need to enable the Cloud
Datastore API in the [Google Developers Console](https://console.developers.google.com/project/_/apiui/apiview/datastore/overview).

## Running locally

Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

When running locally, you can use the [Google Cloud SDK](https://cloud.google.com/sdk)
to provide authentication to use Google Cloud APIs:

    gcloud init

Set the `GCLOUD_PROJECT` environment variable to your Project ID before starting your application:

    export GCLOUD_PROJECT=<your-project-id>
    npm install
    npm start
