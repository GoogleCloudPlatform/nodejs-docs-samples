# Node.js Twilio voice and SMS sample for Google App Engine

This sample demonstrates how to use [Twilio](https://www.twilio.com) on
[Google App Engine Flexible Environment](https://cloud.google.com/appengine).

For more information about Twilio, see the
[Twilio Node library](https://www.twilio.com/docs/node/install).

## Setup

Before you can run or deploy the sample, you will need to do the following:

1. [Create a Twilio Account](http://ahoy.twilio.com/googlecloudplatform). Google
App Engine customers receive a complimentary credit for SMS messages and inbound
messages.

1. Create a number on twilio, and configure the voice request URL to be
`https://<your-project-id>.appspot.com/call/receive` and the SMS request URL to
be `https://<your-project-id>.appspot.com/sms/receive`.

1. Configure your Twilio settings in the environment variables section in
`app.yaml`.

## Running locally

Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

You can run the application locally to test the callbacks and SMS sending. You
will need to set environment variables before starting your application:

    export TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
    export TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
    export TWILIO_NUMBER=<your-twilio-number>
    npm start
