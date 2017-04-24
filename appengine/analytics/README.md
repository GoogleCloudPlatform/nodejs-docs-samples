# Integrating with Google Analytics

This is the sample application for the
[Integrating with Google Analytics tutorial][tutorial] tutorial found in the
[Google App Engine Node.js Flexible Environment][appengine] documentation.

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

    With `npm`:

        npm install

    or with `yarn`:

        yarn install

## Running locally

With `npm`:

    GA_TRACKING_ID=YOUR_TRACKING_ID npm start

or with `yarn`:

    GA_TRACKING_ID=YOUR_TRACKING_ID yarn start

## Deploying to App Engine

With `npm`:

    npm run deploy

or with `yarn`:

    yarn run deploy

## Running the tests

See [Contributing][contributing].

[appengine]: https://cloud.google.com/appengine/docs/flexible/nodejs
[tutorial]: https://cloud.google.com/appengine/docs/flexible/nodejs/integrating-with-analytics
[readme]: ../README.md
[tracking]: https://support.google.com/analytics/answer/1042508
[contributing]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/CONTRIBUTING.md
