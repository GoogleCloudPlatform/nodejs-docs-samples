# Cloud Run End User Authentication with PostgreSQL Database Sample

This sample integrates with the Identity Platform to authenticate users to the
application and connects to a Cloud SQL postgreSQL database for data storage.

Use it with the [End user Authentication for Cloud Run](http://cloud.google.com/run/docs/tutorials/end-user).

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

## Dependencies

* **express**: Web server framework
* **@google-cloud/logging-winston** + **winston**: Logging library
* **@google-cloud/secret-manager**: Google Secret Manager client library
* **firebase-admin**: Verifying JWT token
* **knex**: A SQL query builder library
* **pug**: Template engine


## Environment Variables

Cloud Run services can be [configured with Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables).
Required variables for this sample include:

* `SECRETS`: The Cloud Run service will be notified of images uploaded to this Cloud Storage bucket. The service will then retreive and process the image.

OR

* `CLOUD_SQL_CONNECTION_NAME`='<MY-PROJECT>:<INSTANCE-REGION>:<MY-DATABASE>'
* `DB_USER`='my-db-user'
* `DB_PASS`='my-db-pass'
* `DB_NAME`='my_db'

Note: Saving credentials in environment variables is convenient, but not secure.