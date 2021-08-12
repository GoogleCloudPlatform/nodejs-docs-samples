# Integrating with Google Analytics

This sample application shows how to integrate your Node.js application with
Google Analytics on Google App Engine.

[App Engine standard environment][appengine-std] users: See tutorial [Integrating with Google Analytics][std-tutorial] for more information on running and deploying this app.

[App Engine flexible environment][appengine-flex] users: See tutorial [Integrating with Google Analytics][flex-tutorial] for more information on running and deploying this app.

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

    GA_TRACKING_ID=YOUR_TRACKING_ID npm start

## Deploying to App Engine standard Environment

```
gcloud app deploy app.standard.yaml
```

## Deploying to App Engine flexible Environment

```
gcloud app deploy app.flexible.yaml
```


## Running the tests

See [Contributing][contributing].

[appengine-flex]: https://cloud.google.com/appengine/docs/flexible/nodejs
[appengine-std]: https://cloud.google.com/appengine/docs/standard/nodejs
[flex-tutorial]: https://cloud.google.com/appengine/docs/flexible/nodejs/integrating-with-analytics
[std-tutorial]: https://cloud.google.com/appengine/docs/standard/nodejs/integrating-with-analytics
[readme]: ../README.md
[tracking]: https://support.google.com/analytics/answer/1042508
[contributing]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/CONTRIBUTING.md
