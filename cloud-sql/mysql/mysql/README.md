# Connecting to Cloud SQL - MySQL

## Before you begin

1. If you haven't already, set up a Node.js Development Environment by following the [Node.js setup guide](https://cloud.google.com/nodejs/docs/setup)  and 
[create a project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project).

1. Create a 2nd Gen Cloud SQL Instance by following these 
[instructions](https://cloud.google.com/sql/docs/mysql/create-instance). Note the connection string,
database user, and database password that you create.

1. Create a database for your application by following these 
[instructions](https://cloud.google.com/sql/docs/mysql/create-manage-databases). Note the database
name. 

1. Create a service account with the 'Cloud SQL Client' permissions by following these 
[instructions](https://cloud.google.com/sql/docs/mysql/connect-external-app#4_if_required_by_your_authentication_method_create_a_service_account).
Download a JSON key to use to authenticate your connection. 


1. Use the information noted in the previous steps:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service/account/key.json
export CLOUD_SQL_CONNECTION_NAME='<MY-PROJECT>:<INSTANCE-REGION>:<MY-DATABASE>'
export DB_USER='my-db-user'
export DB_PASS='my-db-pass'
export DB_NAME='my_db'
```
Note: Saving credentials in environment variables is convenient, but not secure - consider a more
secure solution such as [Cloud KMS](https://cloud.google.com/kms/) to help keep secrets safe.

## Running locally

To run this application locally, download and install the `cloud_sql_proxy` by
following the instructions [here](https://cloud.google.com/sql/docs/mysql/sql-proxy#install).

Once the proxy is ready, use the following command to start the proxy in the
background:
```bash
./cloud_sql_proxy -dir=/cloudsql --instances=$CLOUD_SQL_CONNECTION_NAME --credential_file=$GOOGLE_APPLICATION_CREDENTIALS
```
Note: Make sure to run the command under a user with write access in the 
`/cloudsql` directory. This proxy will use this folder to create a unix socket
the application will use to connect to Cloud SQL. 

Next, setup install the requirements with `npm`:
```bash
npm install
```

Finally, start the application:
```bash
npm start
```

Navigate towards `http://127.0.0.1:8080` to verify your application is running correctly.

## Google App Engine Standard

To run on GAE-Standard, create an App Engine project by following the setup for these 
[instructions](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart#before-you-begin).

First, update `app.standard.yaml` with the correct values to pass the environment 
variables into the runtime.

Next, the following command will deploy the application to your Google Cloud project:
```bash
gcloud app deploy app.standard.yaml
```

To launch your browser and view the app at https://[YOUR_PROJECT_ID].appspot.com, run the following
command:
```bash
gcloud app browse
```

## Deploy to Google App Engine Flexible

First, update `app.flexible.yaml` with the correct values to pass the environment 
variables into the runtime.

Next, the following command will deploy the application to your Google Cloud project:
```bash
gcloud app deploy app.flexible.yaml
```

To launch your browser and view the app at https://[YOUR_PROJECT_ID].appspot.com, run the following
command:
```bash
gcloud app browse
```

