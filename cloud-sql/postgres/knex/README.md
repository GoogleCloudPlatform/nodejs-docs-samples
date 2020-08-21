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
[instructions](https://cloud.google.com/sql/docs/postgres/connect-external-app#4_if_required_by_your_authentication_method_create_a_service_account).
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

## Initialize the Cloud SQL database

Setting up the Cloud SQL database for the app requires setting up the app for local use.

1. To run this application locally, download and install the `cloud_sql_proxy` by
[following the instructions](https://cloud.google.com/sql/docs/postgres/sql-proxy#install).

Instructions are provided below for using the proxy with a TCP connection or a Unix Domain Socket.
On Linux or Mac OS you can use either option, but on Windows the proxy currently requires a TCP
connection.

### Launch proxy with TCP

To run the sample locally with a TCP connection, set environment variables and launch the proxy as
shown below.

#### Linux / Mac OS
Use these terminal commands to initialize environment variables:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service/account/key.json
export DB_HOST='127.0.0.1:5432'
export DB_USER='<DB_USER_NAME>'
export DB_PASS='<DB_PASSWORD>'
export DB_NAME='<DB_NAME>'
```

Then use this command to launch the proxy in the background:
```bash
./cloud_sql_proxy -instances=<project-id>:<region>:<instance-name>=tcp:5432 -credential_file=$GOOGLE_APPLICATION_CREDENTIALS &
```

#### Windows/PowerShell
Use these PowerShell commands to initialize environment variables:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="<CREDENTIALS_JSON_FILE>"
$env:DB_HOST="127.0.0.1:5432"
$env:DB_USER="<DB_USER_NAME>"
$env:DB_PASS="<DB_PASSWORD>"
$env:DB_NAME="<DB_NAME>"
```

Then use this command to launch the proxy in a separate PowerShell session:
```powershell
Start-Process -filepath "C:\<path to proxy exe>" -ArgumentList "-instances=<project-id>:<region>:<instance-name>=tcp:5432 -credential_file=<CREDENTIALS_JSON_FILE>"
```

### Launch proxy with Unix Domain Socket
NOTE: this option is currently only supported on Linux and Mac OS. Windows users should use the
[Launch proxy with TCP](#launch-proxy-with-tcp) option.

To use a Unix socket, you'll need to create a directory and give write access to the user running
the proxy. For example:
```bash
sudo mkdir /path/to/the/new/directory
sudo chown -R $USER /path/to/the/new/directory
```
You'll also need to initialize an environment variable containing the directory you just created:
```bash
export DB_SOCKET_PATH=/path/to/the/new/directory
```

Use these terminal commands to initialize other environment variables as well:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service/account/key.json
export CLOUD_SQL_CONNECTION_NAME='<MY-PROJECT>:<INSTANCE-REGION>:<INSTANCE-NAME>'
export DB_USER='<DB_USER_NAME>'
export DB_PASS='<DB_PASSWORD>'
export DB_NAME='<DB_NAME>'
```

Then use this command to launch the proxy in the background:

```bash
./cloud_sql_proxy -dir=$DB_SOCKET_PATH --instances=$CLOUD_SQL_CONNECTION_NAME --credential_file=$GOOGLE_APPLICATION_CREDENTIALS &
```

### Testing the application

2. Next, install the Node.js packages necessary to run the app locally by running the following command:

    ```
    npm install
    ```

3. Run `createTable.js` to create the database table the app requires and to ensure that the database is properly configured.
With the Cloud SQL proxy running, run the following command to create the sample app's table in your Cloud SQL PostgreSQL database:

    ```
    node createTable.js $DB_USER $DB_PW $DB_NAME $CLOUD_SQL_CONNECTION_NAME
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

## Deploy to Cloud Run

See the [Cloud Run documentation](https://cloud.google.com/sql/docs/postgres/connect-run)
for more details on connecting a Cloud Run service to Cloud SQL.

1. Build the container image:

```sh
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/run-sql
```

2. Deploy the service to Cloud Run:

```sh
gcloud run deploy run-sql --image gcr.io/[YOUR_PROJECT_ID]/run-sql
```

Take note of the URL output at the end of the deployment process.

3. Configure the service for use with Cloud Run

```sh
gcloud run services update run-sql \
    --add-cloudsql-instances [CLOUD_SQL_CONNECTION_NAME] \
    --set-env-vars CLOUD_SQL_CONNECTION_NAME=[CLOUD_SQL_CONNECTION_NAME],\
      DB_USER=[MY_DB_USER],DB_PASS=[MY_DB_PASS],DB_NAME=[MY_DB]
```
Replace environment variables with the correct values for your Cloud SQL
instance configuration.

This step can be done as part of deployment but is separated for clarity.

4. Navigate your browser to the URL noted in step 2.

For more details about using Cloud Run see http://cloud.run.
Review other [Node.js on Cloud Run samples](../../../run/).
