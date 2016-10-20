# Google App Engine Node.js Samples

These are samples for using Node.js on Google App Engine Managed VMs. These
samples are referenced from the [docs](https://cloud.google.com/appengine/docs).

See our other [Google Cloud Platform github repos](https://github.com/GoogleCloudPlatform)
for sample applications and scaffolding for other frameworks and use cases.

## Run Locally

Some samples have specific instructions. If there is a README in the sample
folder, please refer to it for any additional steps required to run the sample.

In general, the samples typically require:

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/), including the
[gcloud tool](https://cloud.google.com/sdk/gcloud/), and
[gcloud app component](https://cloud.google.com/sdk/gcloud-app).
1. Setup the gcloud tool. This provides authentication to Google Cloud APIs and
services.

        gcloud init

1. Clone this repo.

        git clone https://github.com/GoogleCloudPlatform/<REPO NAME>.git

1. Open a sample folder, install dependencies, and run the sample:

        cd <sample-folder>/
        npm install
        npm start

1. Visit the application at [http://localhost:8080](http://localhost:8080).

## Deploying

Some samples in this repositories may have special deployment instructions.
Refer to the README file in the sample folder.

1. Use the [Google Developers Console](https://console.developer.google.com) to
create a project/app id. (App id and project id are identical.)
1. Setup the gcloud tool, if you haven't already.

        gcloud init

1. Use gcloud to deploy your app.

        gcloud app deploy

1. Awesome! Your application is now live at `your-project-id.appspot.com`.


## Samples

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

[aeanalytics_1]: analytics
[aelogging_1]: logging
[aepubsub_1]: pubsub
[aestorage_1]: storage

[express_1]: express
[express_2]: https://cloud.google.com/nodejs/resources/frameworks/express
[express_3]: http://express-dot-nodejs-docs-samples.appspot.com
[express_4]: http://expressjs.com/
[express_5]: express-memcached-session
[express_6]: https://github.com/balor/connect-memcached

[geddy_1]: geddy
[geddy_2]: https://cloud.google.com/nodejs/resources/frameworks/geddy
[geddy_3]: http://geddy-dot-nodejs-docs-samples.appspot.com
[geddy_4]: http://geddyjs.org/

[hapi_1]: hapi
[hapi_2]: https://cloud.google.com/nodejs/resources/frameworks/hapi
[hapi_3]: http://hapi-dot-nodejs-docs-samples.appspot.com
[hapi_4]: http://hapijs.com/

[loopback_1]: loopback
[loopback_2]: https://cloud.google.com/nodejs/resources/frameworks/loopback
[loopback_3]: http://loopback-dot-nodejs-docs-samples.appspot.com
[loopback_4]: http://loopback.io/

[koa_1]: koa
[koa_2]: https://cloud.google.com/nodejs/resources/frameworks/koa
[koa_3]: http://koa-dot-nodejs-docs-samples.appspot.com
[koa_4]: http://koajs.com/

[kraken_1]: kraken
[kraken_2]: https://cloud.google.com/nodejs/resources/frameworks/kraken
[kraken_3]: http://kraken-dot-nodejs-docs-samples.appspot.com
[kraken_4]: http://krakenjs.com/

[parse_1]: parse-server

[restify_1]: restify
[restify_2]: https://cloud.google.com/nodejs/resources/frameworks/restify
[restify_3]: http://restify-dot-nodejs-docs-samples.appspot.com
[restify_4]: http://restify.com/

[sails_1]: sails
[sails_2]: https://cloud.google.com/nodejs/resources/frameworks/sails
[sails_3]: http://sails-dot-nodejs-docs-samples.appspot.com
[sails_4]: http://sailsjs.org/

[aedatastore_1]: datastore
[aecloudsql_1]: cloudsql
[memcached_1]: memcached

[mongodb_1]: mongodb
[mongodb_2]: https://cloud.google.com/nodejs/resources/databases/mongodb
[mongodb_3]: https://docs.mongodb.org/

[redis_1]: redis
[redis_2]: https://cloud.google.com/nodejs/resources/databases/redis
[redis_3]: https://redis.io/

[gcloud_1]: https://github.com/GoogleCloudPlatform/gcloud-node
[gcloud_2]: https://googlecloudplatform.github.io/gcloud-node/#/

[bower_1]: bower
[bower_2]: https://cloud.google.com/nodejs/resources/tools/bower
[bower_3]: http://bower.io/

[grunt_1]: grunt
[grunt_2]: https://cloud.google.com/nodejs/resources/tools/grunt
[grunt_3]: http://grunt-dot-nodejs-docs-samples.appspot.com
[grunt_4]: http://gruntjs.com/

[mailgun_1]: mailgun
[mailgun_2]: https://cloud.google.com/nodejs/resources/tools/mailgun
[mailgun_3]: http://www.mailgun.com/

[sendgrid_1]: sendgrid
[sendgrid_2]: https://cloud.google.com/nodejs/resources/tools/sendgrid
[sendgrid_3]: http://sendgrid.com/

[twilio_1]: twilio

[webpack_1]: webpack
[webpack_2]: https://cloud.google.com/nodejs/resources/tools/webpack
[webpack_3]: https://webpack.github.io/

[websockets_1]: websockets

[expresshw_1]: hello-world
[aedisk_1]: disk
[aeextending_1]: extending-runtime
[aestaticfiles_1]: static-files
