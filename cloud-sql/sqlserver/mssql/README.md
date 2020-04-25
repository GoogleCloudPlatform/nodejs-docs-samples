# Connecting to Cloud SQL - MS SQL Server

## Before you begin

1. If you haven't already, set up a Node.js Development Environment by following the [Node.js setup guide](https://cloud.google.com/nodejs/docs/setup)  and 
[create a project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project).

1. [Create a Google Cloud SQL "SQL Server" instance](
    https://console.cloud.google.com/sql/choose-instance-engine).

1.  Under the instance's "USERS" tab, create a new user. Note the "User name" and "Password".

1.  Create a new database in your Google Cloud SQL instance.
    
    1.  List your database instances in [Cloud Cloud Console](
        https://console.cloud.google.com/sql/instances/).
    
    1.  Click your Instance Id to see Instance details.

    1.  Click DATABASES.

    1.  Click **Create database**.

    1.  For **Database name**, enter `votes`.

    1.  Click **CREATE**.

1. Create a service account with the 'Cloud SQL Client' permissions by following these 
[instructions](https://cloud.google.com/sql/docs/mysql/connect-external-app#4_if_required_by_your_authentication_method_create_a_service_account).
Download a JSON key to use to authenticate your connection. 


## Running locally
Use the information noted in the previous steps to set the following environment variables:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service/account/key.json
export DB_USER='my-db-user'
export DB_PASS='my-db-pass'
export DB_NAME='my_db'
```
Note: Saving credentials in environment variables is convenient, but not secure - consider a more
secure solution such as [Secret Manager](https://cloud.google.com/secret-manager/docs/overview) to help keep secrets safe.

Download and install the `cloud_sql_proxy` by
following the instructions [here](https://cloud.google.com/sql/docs/mysql/sql-proxy#install). 

Then, use the following command to start the proxy in the
background using TCP:
```bash
./cloud_sql_proxy -instances=${CLOUD_SQL_CONNECTION_NAME}=tcp:1433 sqlserver -u ${DB_USER} --host 127.0.0.1
```

Next, setup install the requirements with `npm`:
```bash
npm install
```

Finally, start the application:
```bash
npm start
```

Navigate towards `http://127.0.0.1:8080` to verify your application is running correctly.

## Deploy to Google App Engine Flexible

App Engine Flexible supports connecting to your SQL Server instance through TCP

First, update `app.yaml` with the correct values to pass the environment 
variables and instance name into the runtime.

Then, make sure that the service account `service-{PROJECT_NUMBER}>@gae-api-prod.google.com.iam.gserviceaccount.com` has the IAM role `Cloud SQL Client`.

The following command will deploy the application to your Google Cloud project:
```bash
gcloud beta app deploy
```