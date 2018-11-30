# Connecting to Cloud SQL - PostgreSQL

## Before you begin

1. If you haven't already, set up a Node.js Development Environment by following the [Node.js setup guide](https://cloud.google.com/nodejs/docs/setup)  and 
[create a project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project).

2. Create a Cloud SQL for PostgreSQL instance by following these 
[instructions](https://cloud.google.com/sql/docs/postgres/create-instance). Note the instance name that you create,
and password that you specify for the default 'postgres' user.

    * If you don't want to use the default user to connect, [create a user](https://cloud.google.com/sql/docs/postgres/create-manage-users#creating).

3. Create a database for your application by following these [instructions](https://cloud.google.com/sql/docs/postgres/create-manage-databases). Note the database name.

4. Create a service account with the 'Cloud SQL Client' permissions by following these 
[instructions](https://cloud.google.com/sql/docs/mysql/connect-external-app#4_if_required_by_your_authentication_method_create_a_service_account).
Download a JSON key to use to authenticate your connection.


5. Use the information noted in the previous steps:
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

1. To run this application locally, download and install the `cloud_sql_proxy` by
following the instructions [here](https://cloud.google.com/sql/docs/postgres/sql-proxy#install).

    Once the proxy is ready, use the following command to start the proxy in the
    background:
    ```bash
    ./cloud_sql_proxy -dir=/cloudsql -instances=$CLOUD_SQL_CONNECTION_NAME -credential_file=$GOOGLE_APPLICATION_CREDENTIALS
    ```
    Note: Make sure to run the command under a user with write access in the 
    `/cloudsql` directory. This proxy will use this folder to create a unix socket
    the application will use to connect to Cloud SQL.

2. Next, install the Node.js packages necessary to run the app locally by running the following command:

    ```
    npm install
    ```

3. Run `createTable.js` to create the database table the app requires and to ensure that the database is properly configured.
With the Cloud SQL proxy running, run the following command to create the sample app's table in your Cloud SQL PostgreSQL database:

    ```
    node createTable.js
    ``` 

4. Run the sample app locally with the following command:

    ```
    npm start
    ```

Navigate towards `http://127.0.0.1:8080` to verify your application is running correctly.

## Deploy to Google App Engine Standard

1. To allow your app to connect to your Cloud SQL instance when the app is deployed, add the user, password, database, and instance connection name variables from Cloud SQL to the related environment variables in the `app.standard.yaml` file. The deployed application will connect via unix sockets.

    ```
    env_variables:
      DB_USER: MY_DB_USER
      DB_PASS: MY_DB_PASSWORD
      DB_NAME: MY_DATABASE
      # e.g. my-awesome-project:us-central1:my-cloud-sql-instance
      CLOUD_SQL_CONNECTION_NAME: <MY-PROJECT>:<INSTANCE-REGION>:<MY-DATABASE>
    ```

2. To deploy to App Engine Standard, run the following command:

    ```
    gcloud app deploy app.standard.yaml
    ```

3. To launch your browser and view the app at https://[YOUR_PROJECT_ID].appspot.com, run the following command:

    ```
    gcloud app browse
    ```

## Deploy to Google App Engine Flexible

1. Add the user, password, database, and instance connection name variables from Cloud SQL to the related environment variables in the `app.flexible.yaml` file. The deployed application will connect via unix sockets.

    ```
    env_variables:
      DB_USER: MY_DB_USER
      DB_PASS: MY_DB_PASSWORD
      DB_NAME: MY_DATABASE
      # e.g. my-awesome-project:us-central1:my-cloud-sql-instance
      CLOUD_SQL_CONNECTION_NAME: <MY-PROJECT>:<INSTANCE-REGION>:<MY-DATABASE>
    ```

2. To deploy to App Engine Node.js Flexible Environment, run the following command:

    ```
    gcloud app deploy app.flexible.yaml
    ```

3. To launch your browser and view the app at https://[YOUR_PROJECT_ID].appspot.com, run the following command:

    ```
    gcloud app browse
    ```

