# Connecting to Cloud SQL - PostgreSQL

## Before you begin

1. If you haven't already, set up a Node.js Development Environment (including google-cloud-sdk, Node Version Manager (NVM) and Node Package Manager (NPM)) by following the [Node.js setup guide](https://cloud.google.com/nodejs/docs/setup).

2. Create or select a GCP project in the GCP Console and then ensure that project includes an App Engine application and billing is enabled: 

    [Go to APP ENGINE](https://console.cloud.google.com/projectselector/appengine/create?lang=nodejs)

3. Enable the Cloud SQL API.

    [ENABLE the API](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin&redirect=https://console.cloud.google.com)

4. If you haven't yet downloaded and initialized the Google Cloud SDK:

    [DOWNLOAD the SDK](https://cloud.google.com/sdk/docs/)


## Configuring the Cloud SQL instance

1. Create a Cloud SQL for PostgreSQL instance by following these 
[instructions](https://cloud.google.com/sql/docs/postgres/create-instance). Note the instance name that you create,
and password that you specify for the default 'postgres' user.

    * If you don't want to use the default user to connect, [create a user](https://cloud.google.com/sql/docs/postgres/create-manage-users#creating).

1. Run the following gcloud command and record the connection name for the instance:

    `gcloud sql instances describe [INSTANCE_NAME]`

    For example the connection name should look something like:

    `connectionName: project1:us-central1:instance1`

1. Create a database for your application using the following gcloud command:

    `gcloud sql databases create [DATABASE_NAME] --instance=[INSTANCE_NAME]`

## Creating a Service Account

1. Create a service account with the 'Cloud SQL Client' permissions by following these 
[instructions](https://cloud.google.com/sql/docs/mysql/connect-external-app#4_if_required_by_your_authentication_method_create_a_service_account).
Download a JSON key to use to authenticate your connection.

2. Run the following command to create an environment variable referencing
the location of the JSON key downloading in the previous step:

    `export GOOGLE_APPLICATION_CREDENTIALS=$HOME/[YOUR-JSON-KEY-FILENAME]`


## Install and run the Cloud SQL proxy

1. Install the Cloud SQL proxy by following the instructions:
in the [Cloud SQL proxy quickstart](https://cloud.google.com/sql/docs/postgres/quickstart-proxy-test).


## Setting connection strings and adding a library

1. Set up the local environment to support connections for local testing.
  
    For this sample app, you should run the following commands:

    ```
    export SQL_USER=[YOUR_SQL_USER]
    export SQL_PASSWORD=[YOUR_SQL_PASSWORD]
    export SQL_DATABASE=[YOUR_SQL_DATABASE]
    npm install
    ```
    By default, when you run the app locally it tries to connect using TCP sockets. If you configured the proxy to use Unix sockets, set this additional environment variable:

    `export INSTANCE_CONNECTION_NAME=[YOUR_INSTANCE_CONNECTION_NAME]`

2. To allow your app to connect to your Cloud SQL instance when the app is deployed, add the user, password, database, and instance connection name variables from Cloud SQL to the related environment variables in the `app.standard.yaml` file. The deployed application will connect via unix sockets.

    ```
    env_variables:
      SQL_USER: YOUR_SQL_USER
      SQL_PASSWORD: YOUR_SQL_PASSWORD
      SQL_DATABASE: YOUR_SQL_DATABASE
      # e.g. my-awesome-project:us-central1:my-cloud-sql-instance
      INSTANCE_CONNECTION_NAME: YOUR_INSTANCE_CONNECTION_NAME
    ```

## Create a table for the sample app 

Run `createTable.js` to create the table you need and to ensure that the database is properly configured.
With the cloudsql proxy running, run the following command to create the sample app's table in your Cloud SQL PostgreSQL database:

  1. Run createTable.js with the following command:
  `node createTable.js ` 

## Deploying locally

To run this application locally:

  1. Start the Cloud SQL proxy so that it is running locally.
  
  2. In a separate terminal window run the following command:

      `npm start`

Navigate towards `http://127.0.0.1:8080` to verify your application is running correctly.

## Deploy to Google App Engine Standard

1. After local testing, deploy your app to App Engine:

    `gcloud app deploy app.standard.yaml`

2. To launch your browser and view the app at http://[YOUR_PROJECT_ID].appspot.com, run the following command:

    `gcloud app browse`
