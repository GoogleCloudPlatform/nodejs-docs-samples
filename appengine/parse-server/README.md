# Parse-server sample for Google App Engine

This sample shows how to deploy a [Parse-server](https://github.com/ParsePlatform/parse-server)
app to [Google App Engine](https://cloud.google.com/appengine) Node.js [standard
environment](https://cloud.google.com/appengine/docs/standard/nodejs)
and [flexible environment](https://cloud.google.com/appengine/docs/flexible/nodejs).

## Setup

1. Create a project in the [Google Cloud Platform Console](https://console.cloud.google.com/).
1. [Enable billing](https://console.cloud.google.com/project/_/settings) for your project.
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/).
1. Setup a MongoDB server. Here are two possible options:
  1. Create a Google Compute Engine virtual machine with [MongoDB pre-installed](https://cloud.google.com/launcher/?q=mongodb).
  1. Use [MongoLab](https://mongolab.com/google/) to create a free MongoDB deployment on Google Cloud Platform.

## Downloading Files

1. `git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git`
1. `cd appengine/parse-server`

## Running locally

1. `npm install`
1. Set the necessary [environment variables](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/parse-server/config.json).
1. `npm start`

## Deploy to App Engine standard environment

1. Set the necessary [environment variables](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/parse-server/config.json).
1. `gcloud app deploy app.standard.yaml`

## Deploy to App Engine flexible environment

1. Set the necessary [environment variables](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/parse-server/config.json).
1. `gcloud app deploy app.flexible.yaml`

Refer to the [appengine/README.md](../README.md) file for more instructions on
running and deploying.
