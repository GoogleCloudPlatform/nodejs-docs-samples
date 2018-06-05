# Headless Chrome on Google App Engine

This sample application demonstrates how to use Headless Chrome via the [Puppeteer](https://developers.google.com/web/tools/puppeteer/) module to take screenshots of webpages on [Google App Engine](https://cloud.google.com/appengine) Node.js [standard environment](https://cloud.google.com/appengine/docs/standard/nodejs).

## Running locally

* Install dependencies with `npm install` (Headless Chrome will take some time to download),
* Start the application locally using `npm start`.

## Deploy to App Engine

* Install the [Google Cloud SDK](https://cloud.google.com/sdk/) and create a Google Cloud project 
* Run `gcloud app deploy app.standard.yaml`