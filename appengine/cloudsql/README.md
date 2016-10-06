# Node.js Cloud SQL sample on Google App Engine

This sample demonstrates how to use [Google Cloud SQL][sql] (or any other SQL
server) on [Google App Engine Flexible][flexible].

## Setup

Before you can run or deploy the sample, you will need to do the following:

1. Create a [Second Generation Cloud SQL][gen] instance. You can do this from
the [Cloud Console][console] or via the [Cloud SDK][sdk]. To create it via the
SDK use the following command:

        gcloud sql instances create [YOUR_INSTANCE_NAME] \
            --activation-policy=ALWAYS \
            --tier=db-n1-standard-1

    where `[YOUR_INSTANCE_NAME]` is a name of your choice.

1. Set the root password on your Cloud SQL instance:

        gcloud sql instances set-root-password [YOUR_INSTANCE_NAME] --password [YOUR_INSTANCE_ROOT_PASSWORD]

    where `[YOUR_INSTANCE_NAME]` is the name you chose in step 1 and
    `[YOUR_INSTANCE_ROOT_PASSWORD]` is a password of your choice.

1. Create and download a [Service Account][service] for your project. You will
use this service account to connect to your Cloud SQL instance locally.

1. Download and install the [Cloud SQL Proxy][proxy].

1. [Start the proxy][start] to allow connecting to your instance from your local
machine:

        ./cloud_sql_proxy \
            -instances=[YOUR_INSTANCE_CONNECTION_NAME]=tcp:3306 \
            -credential_file=PATH_TO_YOUR_SERVICE_ACCOUNT_JSON_FILE

    where `[YOUR_INSTANCE_CONNECTION_NAME]` is the connection name of your
    instance on its Overview page in the Google Cloud Platform Console, or use
    `[YOUR_PROJECT_ID]:[YOUR_REGION]:[YOUR_INSTANCE_NAME]`.

1. Use the MySQL command line tools (or a management tool of your choice) to
create a [new user][user] and [database][database] for your application:

        mysql -h 127.0.0.1 -P 3306 -u root -p
          mysql> create database `YOUR_DATABASE`;
          mysql> create user 'YOUR_USER'@'%' identified by 'PASSWORD';
          mysql> grant all on YOUR_DATABASE.* to 'YOUR_USER'@'%';

1. Set the `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE` environment
variables (see below). This allows your local app to connect to your Cloud SQL
instance through the proxy.

1. Update the values in in `app.yaml` with your instance configuration.

1. Finally, run `createTables.js` to ensure that the database is properly
configured and to create the tables needed for the sample.

## Running locally

Refer to the [top-level README](../README.md) for instructions on running and deploying.

It's recommended to follow the instructions above to run the Cloud SQL proxy.
You will need to set the following environment variables via your shell before
running the sample:

    export MYSQL_USER="YOUR_USER"
    export MYSQL_PASSWORD="YOUR_PASSWORD"
    export MYSQL_DATABASE="YOUR_DATABASE"
    npm install
    npm start

[sql]: https://cloud.google.com/sql/
[flexible]: https://cloud.google.com/appengine
[gen]: https://cloud.google.com/sql/docs/create-instance
[console]: https://console.developers.google.com
[sdk]: https://cloud.google.com/sdk
[service]: https://cloud.google.com/sql/docs/external#createServiceAccount
[proxy]: https://cloud.google.com/sql/docs/external#install
[start]: https://cloud.google.com/sql/docs/external#6_start_the_proxy
[user]: https://cloud.google.com/sql/docs/create-user
[database]: https://cloud.google.com/sql/docs/create-database
