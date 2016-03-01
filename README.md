# Google Cloud Platform NodeJS Samples

This repository holds Node.js samples used throughout [cloud.google.com]().

[![Build Status](https://travis-ci.org/GoogleCloudPlatform/nodejs-docs-samples.svg)](https://travis-ci.org/GoogleCloudPlatform/nodejs-docs-samples)
[![Coverage Status](https://coveralls.io/repos/github/GoogleCloudPlatform/nodejs-docs-samples/badge.svg?branch=master)](https://coveralls.io/github/GoogleCloudPlatform/nodejs-docs-samples?branch=master)

## Table of Contents

* [Google App Engine](#google-app-engine)
* [Google Cloud Functions](#google-cloud-functions)
* [Google Cloud Logging](#google-cloud-logging)
* [Google Cloud Pub/Sub](#google-cloud-pubsub)
* [Google Cloud Storage](#google-cloud-storage)
* [Google Prediction API](#google-prediction-api)
* [Other Example Apps](#other-example-apps)
* [More Information](#more-information)
* [Contributing](#contributing)
* [License](#license)

## Google App Engine

This is a collection of samples and instructions to run common nodejs frameworks
and applications on [Google App Engine](http://cloud.google.com/nodejs).

__Google (Cloud) Products__

- Google Analytics - [Source code][aeanalytics_1]
- Google Cloud Logging - [Source code][aelogging_1]
- Google Cloud Pub/Sub - [Source code][aepubsub_1]
- Google Cloud Storage - [Source code][aestorage_1]

__Frameworks__

- Express.js - [Source code][express_1] | [App Engine Tutorial][express_2] | [Live demo][express_3] | [Documentation][express_4]
  - Express.js + Memcached Sessions - [Source code][express_5] | [Documentation][express_6]
- Geddy.js - [Source code][geddy_1] | [App Engine Tutorial][geddy_2] | [Live demo][geddy_3] | [Documentation][geddy_4]
- Hapi.js - [Source code][hapi_1] | [App Engine Tutorial][hapi_2] | [Live demo][hapi_3] | [Documentation][hapi_4]
- Loopback.js - [Source code][loopback_1] | [App Engine Tutorial][loopback_2] | [Live demo][loopback_3] | [Documentation][loopback_4]
- Koa.js - [Source code][koa_1] | [App Engine Tutorial][koa_2] | [Live demo][koa_3] | [Documentation][koa_4]
- Kraken.js - [Source code][kraken_1] | [App Engine Tutorial][kraken_2] | [Live demo][kraken_3] | [Documentation][kraken_4]
- Parse-server - [Source code][parse_1]
- Restify.js - [Source code][restify_1] | [App Engine Tutorial][restify_2] | [Live demo][restify_3] | [Documentation][restify_4]
- Sails.js - [Source code][sails_1] | [App Engine Tutorial][sails_2] | [Live demo][sails_3] | [Documentation][sails_4]

__Databases__

- Google Cloud Datastore - [Source code][aedatastore_1]
- Google Cloud SQL - [Source code][aecloudsql_1]
- Memcached - [Source code][memcached_1]
- MongoDB - [Source code][mongodb_1] | [App Engine Tutorial][mongodb_2] | [Documentation][mongodb_3]
- Redis - [Source code][redis_1] | [App Engine Tutorial][redis_2] | [Documentation][redis_3]

__Tools__

- gcloud-node - [Source code][gcloud_1] | [Documentation][gcloud_2]
- Brunch - [Source code][brunch_1] | [Documentation][brunch_2]
- Bower - [Source code][bower_1] | [App Engine Tutorial][bower_2] | [Documentation][bower_3]
- Grunt - [Source code][grunt_1] | [App Engine Tutorial][grunt_2] | [Live demo][grunt_3] | [Documentation][grunt_4]
- Mailgun - [Source code][mailgun_1] | [App Engine Tutorial][mailgun_2] | [Documentation][mailgun_3]
- Sendgrid - [Source code][sendgrid_1] | [App Engine Tutorial][sendgrid_2] | [Documentation][sendgrid_3]
- Twilio - [Source code][twilio_1]
- Webpack - [Source code][webpack_1] | [App Engine Tutorial][webpack_2] | [Documentation][webpack_3]
- WebSockets - [Source code][websockets_1]

__Other Examples__

- Express.js Hello World - [Source code][expresshw_1]
- Extending the runtime - [Source code][aeextending_1]
- Reading/writing from/to disk - [Source code][aedisk_1]
- Serving static files - [Source code][aestaticfiles_1]

## Google Cloud Datastore

- Tasks sample - [Source code][datastore_1] | [Documentation][datastore_2]

## Google Cloud Functions

- Samples - [Source code][functions_1] | [Documentation][functions_2]

## Google Cloud Logging

- Reading logs sample - [Source code][logging_read_1] | [Documentation][logging_read_2]
- Writing logs sample - [Source code][logging_write_1] | [Documentation][logging_write_2]
- Exporting logs sample - [Source code][logging_export_1] | [Documentation][logging_export_2]

## Google Cloud Pub/Sub

- Subscriber/Publisher sample - [Source code][pubsub_subscriber_1] | [Documentation][pubsub_subscriber_2]
- IAM sample - [Source code][pubsub_iam_1] | [Documentation][pubsub_iam_2]

## Google Cloud Storage

- Auth sample - [Source code][storage_1] | [Documentation][storage_2]

## Google Prediction API

- Hosted Models sample - [Source code][predictionapi_1] | [Documentation][predictionapi_2]

## Other Example Apps

- nodejs-getting-started - [Source code][nodejs_1] | [App Engine Tutorial 1][nodejs_2] | [App Engine Tutorial 2][nodejs_3]
- gcloud-node-todos - [Source code][todos_1]
- gitnpm - [Source code][gitnpm_1]
- gcloud-kvstore - [Source code][kvstore_1]

## More information

- [Getting started with nodejs on Google Cloud](http://cloud.google.com/nodejs/)
- See our other [Google Cloud Platform github repos](https://github.com/GoogleCloudPlatform) for sample applications and scaffolding for other frameworks and use cases.
- [Using the `gcloud` npm module](https://googlecloudplatform.github.io/gcloud-node/#/)
- [Logging to Google Cloud with Winston](https://github.com/GoogleCloudPlatform/winston-gae)

## Contributing

Contributions welcome!

See [CONTRIBUTING.md](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/CONTRIBUTING.md)

### Running the tests

1. `git clone git@github.com:GoogleCloudPlatform/nodejs-docs-samples.git`
1. `cd nodejs-docs-samples`
1. `npm install`
1. Start Redis
1. Start Memcached
1. Set the `GCLOUD_PROJECT` environment variable to id of your project
1. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path to
a service account file. You can download one from your Google project's
"permissions" page.
1. `npm test`

Since the tests use [Mocha.js](https://mochajs.org/), you can use the `--grep`
option to run only the tests that match a provided pattern. The `--invert`
option causes the matched tests to be excluded instead of included.

__Run only the tests that match a pattern:__


    npm test -- -- --grep <pattern>

__Only run the tests for the `datastore` sample:__

    npm test -- -- --grep datastore

__Skip the tests that match a pattern:__

    npm test -- -- --grep <pattern> --invert

__Run all but the `datastore` tests:__

    npm test -- -- --grep datastore --invert

__Skip the tests that require Redis and Memcached:__

    npm test -- -- --grep "express-memcached-session|redis" --invert

## License

Apache Version 2.0

See [LICENSE](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/LICENSE)

[aeanalytics_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/analytics
[aelogging_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/logging
[aepubsub_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/pubsub
[aestorage_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/storage

[express_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/express
[express_2]: https://cloud.google.com/nodejs/resources/frameworks/express
[express_3]: http://express-dot-nodejs-docs-samples.appspot.com
[express_4]: http://expressjs.com/
[express_5]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/express-memcached-session
[express_6]: https://github.com/balor/connect-memcached

[geddy_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/geddy
[geddy_2]: https://cloud.google.com/nodejs/resources/frameworks/geddy
[geddy_3]: http://geddy-dot-nodejs-docs-samples.appspot.com
[geddy_4]: http://geddyjs.org/

[hapi_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/hapi
[hapi_2]: https://cloud.google.com/nodejs/resources/frameworks/hapi
[hapi_3]: http://hapi-dot-nodejs-docs-samples.appspot.com
[hapi_4]: http://hapijs.com/

[loopback_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/loopback
[loopback_2]: https://cloud.google.com/nodejs/resources/frameworks/loopback
[loopback_3]: http://loopback-dot-nodejs-docs-samples.appspot.com
[loopback_4]: http://loopback.io/

[koa_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/koa
[koa_2]: https://cloud.google.com/nodejs/resources/frameworks/koa
[koa_3]: http://koa-dot-nodejs-docs-samples.appspot.com
[koa_4]: http://koajs.com/

[kraken_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/kraken
[kraken_2]: https://cloud.google.com/nodejs/resources/frameworks/kraken
[kraken_3]: http://kraken-dot-nodejs-docs-samples.appspot.com
[kraken_4]: http://krakenjs.com/

[parse_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/parse-server

[restify_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/restify
[restify_2]: https://cloud.google.com/nodejs/resources/frameworks/restify
[restify_3]: http://restify-dot-nodejs-docs-samples.appspot.com
[restify_4]: http://restify.com/

[sails_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/sails
[sails_2]: https://cloud.google.com/nodejs/resources/frameworks/sails
[sails_3]: http://sails-dot-nodejs-docs-samples.appspot.com
[sails_4]: http://sailsjs.org/

[aedatastore_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/datastore
[aecloudsql_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/cloudsql
[memcached_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/memcached

[mongodb_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/mongodb
[mongodb_2]: https://cloud.google.com/nodejs/resources/databases/mongodb
[mongodb_3]: https://docs.mongodb.org/

[redis_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/redis
[redis_2]: https://cloud.google.com/nodejs/resources/databases/redis
[redis_3]: https://redis.io/

[gcloud_1]: https://github.com/GoogleCloudPlatform/gcloud-node
[gcloud_2]: https://googlecloudplatform.github.io/gcloud-node/#/

[brunch_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/brunch
[brunch_2]: http://brunch.io

[bower_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/bower
[bower_2]: https://cloud.google.com/nodejs/resources/tools/bower
[bower_3]: http://bower.io/

[grunt_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/grunt
[grunt_2]: https://cloud.google.com/nodejs/resources/tools/grunt
[grunt_3]: http://grunt-dot-nodejs-docs-samples.appspot.com
[grunt_4]: http://gruntjs.com/

[mailgun_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/mailgun
[mailgun_2]: https://cloud.google.com/nodejs/resources/tools/mailgun
[mailgun_3]: http://www.mailgun.com/

[sendgrid_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/sendgrid
[sendgrid_2]: https://cloud.google.com/nodejs/resources/tools/sendgrid
[sendgrid_3]: http://sendgrid.com/

[twilio_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/twilio

[webpack_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/webpack
[webpack_2]: https://cloud.google.com/nodejs/resources/tools/webpack
[webpack_3]: https://webpack.github.io/

[websockets_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/websockets

[expresshw_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/hello-world
[aedisk_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/disk
[aeextending_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/extending-runtime
[aestaticfiles_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/static-files

[datastore_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/datastore/tasks.js
[datastore_2]: https://cloud.google.com/datastore/docs/concepts/overview

[functions_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/functions/
[functions_2]: https://cloud.google.com/functions/docs

[logging_read_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/logging/list.js
[logging_read_2]: https://cloud.google.com/logging/docs/api/tasks/authorization
[logging_write_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/logging/write.js
[logging_write_2]: https://cloud.google.com/logging/docs/api/tasks/creating-logs
[logging_export_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/logging/export.js
[logging_export_2]: https://cloud.google.com/logging/docs/api/tasks/exporting-logs

[pubsub_subscriber_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/pubsub/subscription.js
[pubsub_subscriber_2]: https://cloud.google.com/pubsub/subscriber
[pubsub_iam_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/pubsub/iam.js
[pubsub_iam_2]: https://cloud.google.com/pubsub/access_control

[storage_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/storage/authSample.js
[storage_2]: https://cloud.google.com/storage/docs/authentication#acd-examples

[predictionapi_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/prediction/hostedmodels.js
[predictionapi_2]: https://cloud.google.com/prediction/docs/developer-guide#predictionfromappengine

[nodejs_1]: https://github.com/GoogleCloudPlatform/nodejs-getting-started
[nodejs_2]: https://cloud.google.com/nodejs/getting-started/hello-world
[nodejs_3]: https://cloud.google.com/nodejs/getting-started/tutorial-app

[todos_1]: https://github.com/GoogleCloudPlatform/gcloud-node-todos

[gitnpm_1]: https://github.com/stephenplusplus/gitnpm

[kvstore_1]: https://github.com/stephenplusplus/gcloud-kvstore
