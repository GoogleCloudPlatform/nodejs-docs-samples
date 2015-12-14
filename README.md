# Google Cloud Platform NodeJS Samples

This repository holds the samples used in the nodejs documentation on
[cloud.google.com/nodejs](https://cloud.google.com/nodejs).

[![Build Status](https://travis-ci.org/GoogleCloudPlatform/nodejs-docs-samples.svg)](https://travis-ci.org/GoogleCloudPlatform/nodejs-docs-samples)

## Google App Engine

This is a collection of samples and instructions to run common nodejs frameworks
and applications on [Google App Engine](http://cloud.google.com/nodejs).

### Frameworks

- Express.js - [Source code][express_1] | [App Engine Tutorial][express_2] | [Live demo][express_3] | [Documentation][express_4]
  - Express.js + Memcached Sessions - [Source code][express_5] | [Documentation][express_6]
- Geddy.js - [Source code][geddy_1] | [App Engine Tutorial][geddy_2] | [Live demo][geddy_3] | [Documentation][geddy_4]
- Hapi.js - [Source code][hapi_1] | [App Engine Tutorial][hapi_2] | [Live demo][hapi_3] | [Documentation][hapi_4]
- Loopback.js - [Source code][loopback_1] | [App Engine Tutorial][loopback_2] | [Live demo][loopback_3] | [Documentation][loopback_4]
- Koa.js - [Source code][koa_1] | [App Engine Tutorial][koa_2] | [Live demo][koa_3] | [Documentation][koa_4]
- Kraken.js - [Source code][kraken_1] | [App Engine Tutorial][kraken_2] | [Live demo][kraken_3] | [Documentation][kraken_4]
- Restify.js - [Source code][restify_1] | [App Engine Tutorial][restify_2] | [Live demo][restify_3] | [Documentation][restify_4]
- Sails.js - [Source code][sails_1] | [App Engine Tutorial][sails_2] | [Live demo][sails_3] | [Documentation][sails_4]

### Databases

- MongoDB - [Source code][mongodb_1] | [App Engine Tutorial][mongodb_2] | [Documentation][mongodb_3]
- Redis - [Source code][redis_1] | [App Engine Tutorial][redis_2] | [Documentation][redis_3]

### Tools

- gcloud-node - [Source code][gcloud_1] | [Documentation][gcloud_2]
- Bower - [Source code][bower_1] | [App Engine Tutorial][bower_2] | [Documentation][bower_3]
- Grunt - [Source code][grunt_1] | [App Engine Tutorial][grunt_2] | [Live demo][grunt_3] | [Documentation][grunt_4]
- Mailgun - [Source code][mailgun_1] | [App Engine Tutorial][mailgun_2] | [Documentation][mailgun_3]
- Sendgrid - [Source code][sendgrid_1] | [App Engine Tutorial][sendgrid_2] | [Documentation][sendgrid_3]
- Webpack - [Source code][webpack_1] | [App Engine Tutorial][webpack_2] | [Documentation][webpack_3]

## Google Storage

- Auth sample - [Source code][storage_1] | [Google Cloud Docs][storage_2]

## Example Apps

- nodejs-getting-started - [Source code][nodejs_1] | [App Engine Tutorial 1][nodejs_2] | [App Engine Tutorial 2][nodejs_3]
- gcloud-node-todos - [Source code][todos_1]
- gitnpm - [Source code][gitnpm_1]
- gcloud-kvstore - [Source code][kvstore_1]

## More information

- [Getting started with nodejs on Google Cloud](http://cloud.google.com/nodejs/)
- See our other [Google Cloud Platform github repos](https://github.com/GoogleCloudPlatform) for sample applications and scaffolding for other frameworks and use cases.
- [Using the `gcloud` npm module](https://googlecloudplatform.github.io/gcloud-node/#/)
- [Logging to Google Cloud with Winston](https://github.com/GoogleCloudPlatform/winston-gae)

## Contributing changes

Contributions welcome!

See [CONTRIBUTING.md](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/CONTRIBUTING.md)

### Running the tests

1. `git clone git@github.com:GoogleCloudPlatform/nodejs-docs-samples.git`
1. `cd nodejs-docs-samples`
1. `npm install`
1. Start Redis
1. Start Memcached
1. Set the `TEST_PROJECT_ID` environment variable to id of your project
1. `npm test`

Since the tests use [Mocha.js](https://mochajs.org/), you can use the `--grep`
option to run only the tests that match a provided pattern. The `--invert`
option causes the matched tests to be excluded instead of included.

__Run only the tests that match a pattern:__


```
npm test -- -- --grep <pattern>
```

__Only run the tests for the `datastore` sample:__

```
npm test -- -- --grep datastore
```

__Skip the tests that match a pattern:__

```
npm test -- -- --grep <pattern> --invert
```

__Run all but the `datastore` tests:__

```
npm test -- -- --grep datastore --invert
```

__Skip the tests that require Redis and Memcached:__

```
npm test -- -- --grep "express-memcached-session|redis" --invert
```

## Licensing

Apache Version 2.0

See [LICENSE](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/LICENSE)

[storage_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/storage/authSample.js
[storage_2]: https://cloud.google.com/storage/docs/authentication#acd-examples

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

[restify_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/restify
[restify_2]: https://cloud.google.com/nodejs/resources/frameworks/restify
[restify_3]: http://restify-dot-nodejs-docs-samples.appspot.com
[restify_4]: http://restify.com/

[sails_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/sails
[sails_2]: https://cloud.google.com/nodejs/resources/frameworks/sails
[sails_3]: http://sails-dot-nodejs-docs-samples.appspot.com
[sails_4]: http://sailsjs.org/

[mongodb_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/mongodb
[mongodb_2]: https://cloud.google.com/nodejs/resources/databases/mongo
[mongodb_3]: https://docs.mongodb.org/

[redis_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/redis
[redis_2]: https://cloud.google.com/nodejs/resources/databases/redis
[redis_3]: https://redis.io/

[gcloud_1]: https://github.com/GoogleCloudPlatform/gcloud-node
[gcloud_2]: https://googlecloudplatform.github.io/gcloud-node/#/

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

[webpack_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/webpack
[webpack_2]: https://cloud.google.com/nodejs/resources/tools/webpack
[webpack_3]: https://webpack.github.io/

[nodejs_1]: https://github.com/GoogleCloudPlatform/nodejs-getting-started
[nodejs_2]: https://cloud.google.com/nodejs/getting-started/hello-world
[nodejs_3]: https://cloud.google.com/nodejs/getting-started/tutorial-app

[todos_1]: https://github.com/GoogleCloudPlatform/gcloud-node-todos

[gitnpm_1]: https://github.com/stephenplusplus/gitnpm

[kvstore_1]: https://github.com/stephenplusplus/gcloud-kvstore