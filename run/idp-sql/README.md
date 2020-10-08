# Cloud Run End User Authentication with PostgreSQL Database Sample

This sample integrates with the Identity Platform to authenticate users to the
application and connects to a Cloud SQL postgreSQL database for data storage.

Use it with the [End user Authentication for Cloud Run](http://cloud.google.com/run/docs/tutorials/identity-platform).

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

## Dependencies

* **express**: Web server framework
* **winston**: Logging library
* **@google-cloud/secret-manager**: Google Secret Manager client library
* **firebase-admin**: Verifying JWT token
* **knex** + **pg**: A postgreSQL query builder library
* **handlebars.js**: Template engine
* **google-auth-library-nodejs**: Access [compute metadata server](https://cloud.google.com/compute/docs/storing-retrieving-metadata) for project ID

## Environment Variables

Cloud Run services can be [configured with Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables).
Required variables for this sample include:

* `CLOUD_SQL_CREDENTIALS_SECRET`: the resource ID of the secret, in format: `projects/PROJECT_ID/secrets/SECRET_ID/versions/VERSION`. See [postgres-secrets.json](postgres-secrets.json) for secret content.

OR

* `CLOUD_SQL_CONNECTION_NAME`: Cloud SQL instance name, in format: `<MY-PROJECT>:<INSTANCE-REGION>:<MY-DATABASE>`
* `DB_NAME`: Cloud SQL postgreSQL database name
* `DB_USER`: database user
* `DB_PASSWORD`: database password


## Production Considerations

* Both `postgres-secrets.json` and `static/config.js` should not be committed to
  a git repository and should be added to `.gitignore`.

* Saving credentials directly as environment variables is convenient for local testing,
  but not secure for production; therefore using `CLOUD_SQL_CREDENTIALS_SECRET`
  in combination with the Cloud Secrets Manager is recommended.  

## Running Locally

1. Set [environment variables](#environment-variables).

1. To run this application locally, download and install the `cloud_sql_proxy` by
[following the instructions](https://cloud.google.com/sql/docs/postgres/sql-proxy#install).

The proxy can be used with a TCP connection or a Unix Domain Socket. On Linux or
Mac OS you can use either option, but on Windows the proxy currently requires a TCP
connection.

* [Instructions to launch proxy with Unix Domain Socket](../../cloud-sql/postgres/knex#launch-proxy-with-unix-domain-socket)

* [Instructions to launch proxy with TCP](../../cloud-sql/postgres/knex#launch-proxy-with-tcp)

## Testing

Tests expect the Cloud SQL instance to already be created and environment Variables
to be set.

### Unit tests

```
npm run test
```

### System tests

```
npm run system-test
```
