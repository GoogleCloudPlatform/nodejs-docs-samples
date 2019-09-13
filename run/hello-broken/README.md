# Cloud Run Broken Sample

This sample presents broken code in need of troubleshooting. An alternate
resource at `/improved` shows a more stable implementation with more informative
errors and default values.

Use it with the [Local Container Troubleshooting tutorial](http://cloud.google.com/run/docs/tutorials/local-troubleshooting).

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/run).

## Local Development

### `npm run e2e-test`

```
export SERVICE_NAME=broken
export CONTAINER_IMAGE=gcr.io/${GOOGLE_CLOUD_PROJECT}/broken
npm run e2e-test
```

## Using Testing Scripts

### url.sh

The `url.sh` script derives the automatically provisioned URL of a deployed
Cloud Run service.

```sh
export SERVICE_NAME=broken
export REGION=us-central1
test/url.sh
```

### deploy.sh

The `deploy.sh` script deploys a Cloud Run service.

```sh
export SERVICE_NAME=broken
export CONTAINER_IMAGE=gcr.io/${GOOGLE_CLOUD_PROJECT}/broken
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
* **got**: [Testing] Used to make HTTP requests of the running service in end-to-end testing.
