# Express.js + Memcached Sessions on Google App Engine

This is a simple guide to using memcached for session state while running
[Express.js](http://expressjs.com/) on Google App Engine. Each Google App Engine
application comes with a memcached service instance, which can be reached with a
standard memcached driver at `memcache:11211`. This sample uses the
[connect-memcached](https://github.com/balor/connect-memcached) module to store
session data in memcached.

## Clone the Express.js + Memcached Sessions app

If you haven't already, copy the repository to your local machine by entering
the following command in your terminal window:

    git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
    cd nodejs-docs-samples/appengine/express-memcached-session

Alternatively, you can [download the sample][download] as a zip and extract it.

## Run the app on your local computer

1. Install dependencies. Enter the following command:

    npm install

1. Run the start script.

    npm start

1. In your web browser, enter the following address:

    http://localhost:8080

You can see the sample app displayed in the page. This page was delivered by the
Express.js web server running on your computer.

In your terminal window, press Ctrl+C to exit the web server.

## Deploy the app to Google Cloud Platform

In your terminal window, enter the following command to deploy the sample:

    gcloud app deploy

### See the app run in the cloud

In your web browser, enter the following address:

    https://<your-project-id>.appspot.com

For convenience, you can use an npm script to run the gcloud command. Add these
lines to your package.json file:

    "scripts": {
      "start": "node server.js",
      "deploy": "gcloud app deploy"
    }

At the terminal you can now run the following command to deploy your application:

    npm run deploy

## Configuration

Every Managed VMs application requires an app.yaml file to describe its
deployment configuration.

    runtime: nodejs
    vm: true
    env_variables:
      PORT: 8080
      MEMCACHE_URL: memcache:11211

Notice the `MEMCACHE_URL` environment variable–this is where you can reach your
standard memcached cluster across instances.

[download]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/archive/master.zip
