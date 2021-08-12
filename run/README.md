<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Run Node.js Samples

[Cloud Run][run_docs] runs stateless [containers](https://cloud.google.com/containers/) on a fully managed environment.

## Samples

|                 Sample                  |        Description       |     Deploy    |
| --------------------------------------- | ------------------------ | ------------- |
|[Hello World][helloworld]                | Quickstart | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_helloworld] |
|[System Packages][system_package]        | Use system-installed binaries in your service. | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30">][run_button_system_package]  |
|[Pub/Sub][pubsub]                        | Processing messages from a Pub/Sub push subscription | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_pubsub] |
|[Image Processing][image_processing]     | Cloud Storage & Pub/Sub-driven image analysis & transformation | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_image_processing] |
|[Manual Logging][manual_logging]         | Structured logging without client library | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_manual_logging] |
|[Hello Broken][hello_broken]             | Something is wrong, how do you fix it? | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_hello_broken] |
|[Identity Platform][idp-sql]             | Authenticate users and connect to a Cloud SQL postgreSQL databases |[<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_idp_sql] |
|[Markdown Preview][preview]              | Create a secure two-service application running on Cloud Run | - |
|[Cloud SQL (MySQL)][mysql]               | Use MySQL with Cloud Run | - |
|[Cloud SQL (Postgres)][postgres]         | Use Postgres with Cloud Run | - |
|[Service to Service Requests][idtoken] &#10149;  | Create requests to authenticated-only services | - |
|[Eventarc: Pub/Sub](../eventarc/pubsub) | Event-driven service with Events for Cloud Run for Pub/Sub | - |
|[Eventarc: Cloud Storage](../eventarc/audit-storage) | Event-driven service with Events for Cloud Run for GCS | - |


For more Cloud Run samples beyond Node.js, see the main list in the [Cloud Run Samples repository](https://github.com/GoogleCloudPlatform/cloud-run-samples).

## Setup

1. [Set up for Cloud Run development](https://cloud.google.com/run/docs/setup)

2. Clone this repository:

    ```sh
    git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
    ```

    Note: Some samples in the list above are hosted in other repositories. They are noted with the symbol "&#10149;".

## How to run a sample locally

1. [Install docker locally](https://docs.docker.com/install/)

2. [Build the sample container](https://cloud.google.com/run/docs/building/containers#building_locally_and_pushing_using_docker):

    ```sh
    export SAMPLE=<SAMPLE_NAME>
    cd $SAMPLE
    docker build --tag $SAMPLE .
    ```

3. [Run containers locally](https://cloud.google.com/run/docs/testing/local)

    With the built container:

    ```sh
    PORT=8080 && docker run --rm -p 8080:${PORT} -e PORT=${PORT} $SAMPLE
    ```

    Overriding the built container with local code:

    ```sh
    PORT=8080 && docker run --rm \
        -p 8080:${PORT} -e PORT=${PORT} \
        -v $PWD:/usr/src/app $SAMPLE
    ```

    Injecting your service account key:

    ```sh
    export SA_KEY_NAME=my-key-name-123
    PORT=8080 && docker run --rm \
        -p 8080:${PORT} -e PORT=${PORT} \
        -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/keys/${SA_KEY_NAME}.json \
        -v $GOOGLE_APPLICATION_CREDENTIALS:/tmp/keys/${SA_KEY_NAME}.json:ro \
        -v $PWD:/usr/src/app $SAMPLE
    ```

    Opening a shell in the container (e.g., updating the `package-lock.json`):

    1. Build the container.

    2. Run the container with a shell:

    ```sh
    PORT=8080 && docker run --rm \
        --interactive --tty \
        -p 8080:${PORT} -e PORT=${PORT} \
        -v $PWD:/usr/src/app $SAMPLE \
        /bin/bash
    ```

    3. Re-generate the `package-lock.json`:

    ```sh
    rm package-lock.json
    npm install
    ```

    Because we're using a read/write volume mount, the revised file will be
    written to the host's local filesystem. Once you exit the container you can
    add the file to version control.

    4. Exit the container: `Ctrl-D`

## Running the Tests

Run unit tests:
```sh
npm test
```

Run system tests:
```sh
export GOOGLE_CLOUD_PROJECT=<YOUR_PROJECT_ID>
npm run system-test
```

**Note:** See sample READMEs for specific environment variables needed for
testing.

## Deploying

```sh
gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/${SAMPLE}
gcloud run deploy ${SAMPLE} \
  # Needed for Manual Logging sample.
  --set-env-var GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT} \
  --image gcr.io/${GOOGLE_CLOUD_PROJECT}/${SAMPLE}
```

See [Building containers][run_build] and [Deploying container images][run_deploy]
for more information.

[run_docs]: https://cloud.google.com/run/docs/
[run_build]: https://cloud.google.com/run/docs/building/containers
[run_deploy]: https://cloud.google.com/run/docs/deploying

[helloworld]: helloworld/
[system_package]: system-package/
[pubsub]: pubsub/
[image_processing]: image-processing/
[manual_logging]: logging-manual/
[mysql]: ../cloud-sql/mysql/mysql
[postgres]: ../cloud-sql/postgres/knex
[hello_broken]: hello-broken/
[idtoken]: https://github.com/googleapis/google-auth-library-nodejs/blob/master/samples/idtokens-serverless.js
[preview]: markdown-preview/
[idp-sql]: idp-sql/

[run_button_helloworld]: https://deploy.cloud.run/?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&dir=run/helloworld
[run_button_system_package]: https://deploy.cloud.run/?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&dir=run/system-package
[run_button_pubsub]: https://deploy.cloud.run/?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&dir=run/pubsub
[run_button_image_processing]: https://deploy.cloud.run/?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&dir=run/image-processing
[run_button_manual_logging]: https://deploy.cloud.run/?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&dir=run/logging-manual
[run_button_hello_broken]: https://deploy.cloud.run/?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&dir=run/hello-broken
[run_button_idp_sql]: https://deploy.cloud.run/?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&dir=run/idp-sql
