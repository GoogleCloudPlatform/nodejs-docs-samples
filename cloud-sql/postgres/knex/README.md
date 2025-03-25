# Connecting to Cloud SQL - PostgreSQL

This demo application can be used to connect to Cloud SQL in two different ways:

1. [The Cloud SQL Node.js Connector](https://github.com/GoogleCloudPlatform/cloud-sql-nodejs-connector) (recommended)
2. [The Cloud SQL Auth Proxy](https://github.com/GoogleCloudPlatform/cloud-sql-proxy)

Using the Cloud SQL Node.js Connector package is recommended over the
Cloud SQL Auth Proxy as it provides all the same functionality and features but
as a npm package. See [`@google-cloud/cloud-sql-connector`](https://www.npmjs.com/package/@google-cloud/cloud-sql-connector).

## Before you begin

1. If you haven't already, set up a Node.js Development Environment by following
the [Node.js setup guide](https://cloud.google.com/nodejs/docs/setup)  and
[create a
project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project).

1. Create a Cloud SQL for PostgreSQL instance by following these
[instructions](https://cloud.google.com/sql/docs/postgres/create-instance). Note
the instance `connection name` of the instance that you create, and password
that you specify for the default 'postgres' user.

    * If you don't want to use the default user to connect, [create a
user](https://cloud.google.com/sql/docs/postgres/create-manage-users#creating).

1. Create a database for your application by following these
   [instructions](https://cloud.google.com/sql/docs/postgres/create-manage-databases).
   Note the database name.

1. Set up [Application Default Credentials][adc]

[adc]: https://cloud.google.com/docs/authentication/provide-credentials-adc

Note: Defining credentials in environment variables is convenient, but not
secure. For a more secure solution, use [Secret
Manager](https://cloud.google.com/secret-manager/) to help keep secrets safe.
You can then define `export
CLOUD_SQL_CREDENTIALS_SECRET='projects/PROJECT_ID/secrets/SECRET_ID/versions/VERSION'`
to reference a secret that stores your Cloud SQL database password. The sample
app checks for your defined secret version. If a version is present, the app
retrieves the `DB_PASS` from Secret Manager before it connects to Cloud SQL.

## Cloud SQL Node.js Connector Usage

### Running Locally

To run the demo application locally using the Cloud SQL Node.js Connector, set
environment variables and install dependencies as shown below.

Note: The `INSTANCE_CONNECTION_NAME` for your instance can be found on the
**Overview** page for your instance in the
[Google Cloud console](https://console.cloud.google.com/sql) or by running
the following command:

```sh
gcloud sql instances describe <INSTANCE_NAME> --format='value(connectionName)'
```

#### Linux / Mac OS

Use these terminal commands to initialize environment variables:

```bash
export INSTANCE_CONNECTION_NAME='<INSTANCE_CONNECTION_NAME>'
export DB_USER='<DB_USER_NAME>'
export DB_PASS='<DB_PASSWORD>'
export DB_NAME='<DB_NAME>'
```

#### Windows/PowerShell

Use these PowerShell commands to initialize environment variables:

```powershell
$env:INSTANCE_CONNECTION_NAME="<INSTANCE_CONNECTION_NAME>"
$env:DB_USER="<DB_USER_NAME>"
$env:DB_PASS="<DB_PASSWORD>"
$env:DB_NAME="<DB_NAME>"
```

### Testing the application

1. Next, install the Node.js packages necessary to run the app locally by
   running the following command:

    ```sh
    npm install
    ```

2. Run the sample app locally with the following command:

    ```sh
    npm start
    ```

Navigate towards `http://127.0.0.1:8080` to verify your application is running
correctly.

## Deploy to Google App Engine Standard

1. To allow your app to connect to your Cloud SQL instance when the app is
   deployed, modify the [`app.standard.yaml`](app.standard.yaml) to add the
   user, password, database, and an instance connection name to the related
   environment variables, like in the example below:

    ```yaml
    env_variables:
      INSTANCE_CONNECTION_NAME: <MY-PROJECT>:<INSTANCE-REGION>:<INSTANCE-NAME>
      DB_USER: MY_DB_USER
      DB_PASS: MY_DB_PASSWORD
      DB_NAME: MY_DATABASE
    ```

2. To deploy to App Engine Standard, run the following command:

    ```sh
    gcloud app deploy app.standard.yaml
    ```

3. To launch your browser and view the app at
   <https://[YOUR_PROJECT_ID]>.appspot.com, run the following command:

    ```sh
    gcloud app browse
    ```

## Deploy to Google App Engine Flexible

1. To allow your app to connect to your Cloud SQL instance when the app is
   deployed, modify the [`app.flexible.yaml`](app.flexible.yaml) to add the
   user, password, database, and an instance connection name to the related
   environment variables, like in the example below:

    ```yaml
    env_variables:
      INSTANCE_CONNECTION_NAME: <MY-PROJECT>:<INSTANCE-REGION>:<INSTANCE-NAME>
      DB_USER: MY_DB_USER
      DB_PASS: MY_DB_PASSWORD
      DB_NAME: MY_DATABASE
    ```

2. To deploy to App Engine Node.js Flexible Environment, run the following
   command:

    ```sh
    gcloud app deploy app.flexible.yaml
    ```

3. To launch your browser and view the app at
   <https://[YOUR_PROJECT_ID]>.appspot.com, run the following command:

    ```sh
    gcloud app browse
    ```

## Deploy to Cloud Run

See the [Cloud Run
documentation](https://cloud.google.com/sql/docs/postgres/connect-run) for more
details on connecting a Cloud Run service to Cloud SQL.

Build and deploy the service to Cloud Run:

```sh
gcloud run deploy run-sql --source . /
    --allow-unauthenticated \
    --set-env-vars INSTANCE_CONNECTION_NAME=[INSTANCE_CONNECTION_NAME],\
      DB_USER=[MY_DB_USER],DB_PASS=[MY_DB_PASS],DB_NAME=[MY_DB]
```

Replace environment variables with the correct values for your Cloud SQL
instance configuration.

It is recommended to use the [Secret Manager
integration](https://cloud.google.com/run/docs/configuring/secrets) for Cloud
Run instead of using environment variables for the SQL configuration. The
service injects the SQL credentials from Secret Manager at runtime via an
environment variable.

Create secrets via the command line:

```sh
echo -n $INSTANCE_CONNECTION_NAME | \
    gcloud secrets create [INSTANCE_CONNECTION_NAME_SECRET] --data-file=-
```

Deploy the service to Cloud Run specifying the env var name and secret name:

```sh
gcloud run deploy run-sql --source . /
    --allow-unauthenticated \
    --update-secrets INSTANCE_CONNECTION_NAME=[INSTANCE_CONNECTION_NAME_SECRET]:latest, \
      DB_USER=[DB_USER_SECRET]:latest, \
      DB_PASS=[DB_PASS_SECRET]:latest, \
      DB_NAME=[DB_NAME_SECRET]:latest
```

1. Navigate your browser to the URL noted in step 2.

For more details about using Cloud Run see <http://cloud.run>. Review other
[Node.js on Cloud Run samples](../../../run/).

## Deploy to Cloud Functions

To deploy the service to [Cloud Functions](https://cloud.google.com/functions/docs) run the following command:

```sh
gcloud functions deploy votes --gen2 --runtime nodejs18 --trigger-http \
  --allow-unauthenticated \
  --entry-point votes \
  --region <INSTANCE_REGION> \
  --set-env-vars INSTANCE_CONNECTION_NAME=<PROJECT_ID>:<INSTANCE_REGION>:<INSTANCE_NAME> \
  --set-env-vars DB_USER=$DB_USER \
  --set-env-vars DB_PASS=$DB_PASS \
  --set-env-vars DB_NAME=$DB_NAME
```

## Cloud SQL Auth Proxy Usage

### Running Locally

Setting up the Cloud SQL database for the app requires setting up the app for
local use.

You may optionally download and install the `cloud_sql_proxy` by
[following the
instructions](https://cloud.google.com/sql/docs/postgres/sql-proxy#install).

Instructions are provided below for using the proxy with a TCP connection or a
Unix Domain Socket. On Linux or Mac OS you can use either option, but on Windows
the proxy currently requires a TCP connection.

### Launch proxy with TCP

To run the sample locally with a TCP connection, set environment variables and
launch the proxy as shown below.

#### Linux / Mac OS

Use these terminal commands to initialize environment variables:

```bash
export INSTANCE_HOST='127.0.0.1'
export DB_PORT='5432'
export DB_USER='<DB_USER_NAME>'
export DB_PASS='<DB_PASSWORD>'
export DB_NAME='<DB_NAME>'
```

Then use this command to launch the proxy in the background:

```bash
./cloud-sql-proxy --port=5342 "$INSTANCE_CONNECTION_NAME" &
```

#### Windows/PowerShell

Use these PowerShell commands to initialize environment variables:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="<CREDENTIALS_JSON_FILE>"
$env:INSTANCE_HOST="127.0.0.1"
$env:DB_PORT="5432"
$env:DB_USER="<DB_USER_NAME>"
$env:DB_PASS="<DB_PASSWORD>"
$env:DB_NAME="<DB_NAME>"
```

Then use this command to launch the proxy in a separate PowerShell session:

```powershell
Start-Process -filepath "C:\<path to proxy exe>" -ArgumentList "<project-id>:<region>:<instance-name> --port=5342"
```

### Launch proxy with Unix Domain Socket

NOTE: this option is currently only supported on Linux and Mac OS. Windows users
should use the [Launch proxy with TCP](#launch-proxy-with-tcp) option.

To use a Unix socket, you'll need to create a directory and give write access to
the user running the proxy. For example:

```bash
sudo mkdir ./cloudsql
sudo chown -R $USER ./cloudsql
```

Use these terminal commands to initialize other environment variables as well:

```bash
export INSTANCE_UNIX_SOCKET='./cloudsql/<MY-PROJECT>:<INSTANCE-REGION>:<INSTANCE-NAME>'
export DB_USER='<DB_USER_NAME>'
export DB_PASS='<DB_PASSWORD>'
export DB_NAME='<DB_NAME>'
```

Then use this command to launch the proxy in the background:

```bash
./cloud_sql_proxy --unix-socket=./cloudsql $INSTANCE_CONNECTION_NAME &
```

### Testing the application

1. Next, install the Node.js packages necessary to run the app locally by
   running the following command:

    ```sh
    npm install
    ```

2. Run the sample app locally with the following command:

    ```sh
    npm start
    ```

Navigate towards `http://127.0.0.1:8080` to verify your application is running
correctly.

## Deploy to Google App Engine Standard

1. To allow your app to connect to your Cloud SQL instance when the app is
   deployed, add the user, password, database, and instance unix socket
   variables from Cloud SQL to the related environment variables in the
   [`app.standard.yaml`](app.standard.yaml) file. The deployed application will
   connect via unix sockets.

    ```yaml
    env_variables:
      INSTANCE_UNIX_SOCKET: /cloudsql/<MY-PROJECT>:<INSTANCE-REGION>:<INSTANCE-NAME>
      DB_USER: MY_DB_USER
      DB_PASS: MY_DB_PASSWORD
      DB_NAME: MY_DATABASE
    ```

2. To deploy to App Engine Standard, run the following command:

    ```sh
    gcloud app deploy app.standard.yaml
    ```

3. To launch your browser and view the app at
   <https://[YOUR_PROJECT_ID>].appspot.com, run the following command:

    ```sh
    gcloud app browse
    ```

## Deploy to Google App Engine Flexible

1. Add the user, password, database, and instance unix socket variables from
Cloud SQL to the related environment variables in the
[`app.flexible.yaml`](app.flexible.yaml) file. The deployed application will
connect via unix sockets.

    ```yaml
    env_variables:
      INSTANCE_UNIX_SOCKET: /cloudsql/<MY-PROJECT>:<INSTANCE-REGION>:<INSTANCE-NAME>
      DB_USER: MY_DB_USER
      DB_PASS: MY_DB_PASSWORD
      DB_NAME: MY_DATABASE
    ```

2. To deploy to App Engine Node.js Flexible Environment, run the following
   command:

    ```sh
    gcloud app deploy app.flexible.yaml
    ```

3. To launch your browser and view the app at
   <https://[YOUR_PROJECT_ID>].appspot.com, run the following command:

    ```sh
    gcloud app browse
    ```

## Deploy to Cloud Run

See the [Cloud Run
documentation](https://cloud.google.com/sql/docs/postgres/connect-run) for more
details on connecting a Cloud Run service to Cloud SQL.

1. Build the container image:

```sh
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/run-sql
```

1. Deploy the service to Cloud Run:

```sh
gcloud run deploy run-sql --image gcr.io/[YOUR_PROJECT_ID]/run-sql
```

Take note of the URL output at the end of the deployment process.

1. Configure the service for use with Cloud Run

```sh
gcloud run services update run-sql \
    --add-cloudsql-instances [INSTANCE_CONNECTION_NAME] \
    --set-env-vars INSTANCE_UNIX_SOCKET=[INSTANCE_UNIX_SOCKET],\
      DB_USER=[MY_DB_USER],DB_PASS=[MY_DB_PASS],DB_NAME=[MY_DB]
```

Replace environment variables with the correct values for your Cloud SQL
instance configuration.

This step can be done as part of deployment but is separated for clarity.

It is recommended to use the [Secret Manager
integration](https://cloud.google.com/run/docs/configuring/secrets) for Cloud
Run instead of using environment variables for the SQL configuration. The
service injects the SQL credentials from Secret Manager at runtime via an
environment variable.

Create secrets via the command line:

```sh
echo -n $INSTANCE_UNIX_SOCKET | \
    gcloud secrets create [INSTANCE_UNIX_SOCKET_SECRET] --data-file=-
```

Deploy the service to Cloud Run specifying the env var name and secret name:

```sh
gcloud beta run deploy SERVICE --image gcr.io/[YOUR_PROJECT_ID]/run-sql \
    --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
    --update-secrets INSTANCE_UNIX_SOCKET=[INSTANCE_UNIX_SOCKET_SECRET]:latest,\
      DB_USER=[DB_USER_SECRET]:latest, \
      DB_PASS=[DB_PASS_SECRET]:latest, \
      DB_NAME=[DB_NAME_SECRET]:latest
```

1. Navigate your browser to the URL noted in step 2.

For more details about using Cloud Run see <http://cloud.run>. Review other
[Node.js on Cloud Run samples](../../../run/).

## Deploy to Cloud Functions

To deploy the service to [Cloud Functions](https://cloud.google.com/functions/docs) run the following command:

```sh
gcloud functions deploy votes --gen2 --runtime nodejs18 --trigger-http \
  --allow-unauthenticated \
  --entry-point votes \
  --region <INSTANCE_REGION> \
  --set-env-vars INSTANCE_UNIX_SOCKET=/cloudsql/<PROJECT_ID>:<INSTANCE_REGION>:<INSTANCE_NAME> \
  --set-env-vars DB_USER=$DB_USER \
  --set-env-vars DB_PASS=$DB_PASS \
  --set-env-vars DB_NAME=$DB_NAME
```

Note: If the function fails to deploy or returns a `500: Internal service error`,
this may be due to a known limitation with Cloud Functions gen2 not being able
to configure the underlying Cloud Run service with a Cloud SQL connection.

A workaround command to fix this is is to manually revise the Cloud Run
service with the Cloud SQL Connection:

```sh
gcloud run deploy votes --source . \
  --region <INSTANCE_REGION> \
  --add-cloudsql-instances <PROJECT_ID>:<INSTANCE_REGION>:<INSTANCE_NAME>
```

The Cloud Function command above can now be re-run with a successful deployment.
