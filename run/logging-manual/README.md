# Cloud Run Manual Logging Sample

This sample shows how to send structured logs to Stackdriver Logging.

Read more about Cloud Run logging in the [Logging How-to Guide](http://cloud.google.com/run/docs/logging).

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/run).

## Local Development

### `npm run e2e-test`

```sh
export SERVICE_NAME=logging-manual
export CONTAINER_IMAGE=gcr.io/${GOOGLE_CLOUD_PROJECT}/logging-manual
npm run e2e-test
```

## Using Testing Scripts

### url.sh

The `url.sh` script derives the automatically provisioned URL of a deployed
Cloud Run service.

```sh
export SERVICE_NAME=logging-manual
export REGION=us-central1
test/url.sh
```

### deploy.sh

The `deploy.sh` script deploys a Cloud Run service.

```sh
export SERVICE_NAME=logging-manual
export CONTAINER_IMAGE=gcr.io/${GOOGLE_CLOUD_PROJECT}/logging-manual
export REGION=us-central1
test/deploy.sh
```

### runner.sh

The `runner.sh` script:

* Deploys the service to Cloud Run based on the `deploy.sh` script.
* Sets the `BASE_URL` and `ID_TOKEN` environment variables.
* Runs any arguments passed to the `runner.sh` script.
* Tears down the Cloud Run service on completion.

```sh
test/runner.sh sleep 20
```

## Environment Variables (Testing)

* `BASE_URL`: The Cloud Run service URL for end-to-end tests.
* `ID_TOKEN`: JWT token used to authenticate with Cloud Run's IAM-based authentication.
* `REGION`: [`us-central1`] Optional override region for the location of the Cloud Run service.
* `SERVICE_NAME`: The name of the deployed service, used in some API calls and test assertions.
* `GOOGLE_CLOUD_PROJECT`: If used, overrides GCP metadata server to determine
  the current GCP project. Required by the logging client library.

## Dependencies

* **express**: Web server framework.
* **got**: Used to pull the project ID of the running service from the 
  [compute metadata server](https://cloud.google.com/compute/docs/storing-retrieving-metadata)
  and make system test HTTP requests. This is required in production for log correlation without
  manually setting the $GOOGLE_CLOUD_PROJECT environment variable.
