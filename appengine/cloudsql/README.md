# Node.js Cloud SQL sample on Google App Engine

This sample demonstrates how to use [Cloud SQL](https://cloud.google.com/sql/)
on [Google App Engine Managed VMs](https://cloud.google.com/appengine).

## Setup

Before you can run or deploy the sample, you will need to do the following:

1. Create a Cloud SQL instance. You can do this from the [Google Developers Console](https://console.developers.google.com)
or via the [Cloud SDK](https://cloud.google.com/sdk). To create it via the SDK
use the following command:

        gcloud sql instances create [your-instance-name] \
          --assign-ip \
          --authorized-networks 0.0.0.0/0 \
          --tier D0

1. Create a new user and database for the application. The easiest way to do
this is via the [Google Developers Console](https://console.developers.google.com/project/_/sql/instances/example-instance2/access-control/users).
Alternatively, you can use MySQL tools such as the command line client or
workbench.
1. Update the values in in `app.yaml` with your instance configuration.
1. Finally, run `create_tables.js` to ensure that the database is properly
configured and to create the tables needed for the sample.

## Running locally

Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

To run locally, set the environment variables via your shell before running the
sample:

    export MYSQL_HOST=<your-cloudsql-host>
    export MYSQL_USER=<your-cloudsql-user>
    export MYSQL_PASSWORD=<your-cloudsql-password>
    export MYSQL_DATABASE=<your-cloudsql-database>
    npm install
    npm start
