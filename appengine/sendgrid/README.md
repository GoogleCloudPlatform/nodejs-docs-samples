# Node.js SendGrid email sample for Google App Engine

This sample application shows how to use [SendGrid](https://www.sendgrid.com) on
[Google App Engine](https://cloud.google.com/appengine) Node.js [standard environment](https://cloud.google.com/appengine/docs/standard/nodejs)
and [flexible environment](https://cloud.google.com/appengine/docs/flexible/nodejs).

For more information about SendGrid, see their
[documentation](https://sendgrid.com/docs/User_Guide/index.html).

App Engine Node.js Flexible Environment users may also read the community
tutorial [Sendgrid on App Engine Tutorial][1] for more information on how to
run and deploy this sample app.

## Setup

Before you can run or deploy the sample, you will need to do the following:

1. [Create a SendGrid Account](http://sendgrid.com/partner/google). As of
September 2015, Google users start with 25,000 free emails per month.
1. Configure your SendGrid settings in the environment variables section in
`app.standard.yaml` (if you are deploying to App Engine standard environment) or
`app.flexible.yaml` (if you are deploying to App Engine flexible environment).

## Running locally

Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

You can run the application locally and send emails from your local machine. You
will need to set environment variables before starting your application:

    export SENDGRID_API_KEY=<your-sendgrid-api-key>
    export SENDGRID_SENDER=<your-sendgrid-sender-email-address>
    npm start

[1]: https://cloud.google.com/community/tutorials/send-email-with-sendgrid-and-nodejs-on-google-app-engine
