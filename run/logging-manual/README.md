# Cloud Run Manual Logging Sample

This sample shows how to send structured logs to Stackdriver Logging.

Read more about Cloud Run logging in the [Logging How-to Guide](http://cloud.google.com/run/docs/logging).

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/run).

## Local Development

### `npm run e2e-test`

```
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

The `runner.sh` script is a helper that facilitates:

* Deploy the service to Cloud Run based on the `deploy.sh` script.
* Set the `BASE_URL` and `ID_TOKEN` environment variables.
* Run any arguments passed to the `runner.sh` script.
* Tear down the Cloud Run service on completion.

```sh
test/runner.sh sleep 20
```

## Environment Variables (Testing)

* `BASE_URL`: Used to designate the URL of the Cloud Run service under system test. The URL is not deterministic, so the options are to record it at deploy time or use the Cloud Run API to retrieve the value.
* `ID_TOKEN`: Used for authenticated HTTP requests to the Cloud Run service.
* `REGION`: [`us-central1`] Optional override region for the location of the Cloud Run service.
* `SERVICE_NAME`: Used in testing to specify the name of the service. The name may be included in API calls and test conditions.
* `GOOGLE_CLOUD_PROJECT`: Used in production as an override to determination of the GCP Project from the GCP metadata server. Used in testing to configure the Logging client library.

## Dependencies

* **express**: Web server framework.
* **got**: Used to pull the project ID of the running service from the [compute metadata server](https://cloud.google.com/compute/docs/storing-retrieving-metadata) and make system test HTTP requests. This is required in production for log correlation without manually setting the $GOOGLE_CLOUD_PROJECT environment variable.

