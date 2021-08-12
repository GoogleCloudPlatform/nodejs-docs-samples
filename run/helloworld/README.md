# Cloud Run Hello World Sample

This sample shows how to deploy a Hello World application to Cloud Run.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/run).

## Local Development

### `npm run e2e-test`

```
export SERVICE_NAME=helloworld
export CONTAINER_IMAGE=gcr.io/${GOOGLE_CLOUD_PROJECT}/helloworld
npm run e2e-test
```

## Using Testing Scripts

### url.sh

The `url.sh` script derives the automatically provisioned URL of a deployed
Cloud Run service.

```sh
export SERVICE_NAME=helloworld
export REGION=us-central1
test/url.sh
```

### deploy.sh

The `deploy.sh` script deploys a Cloud Run service.

```sh
export SERVICE_NAME=helloworld
export CONTAINER_IMAGE=gcr.io/${GOOGLE_CLOUD_PROJECT}/helloworld
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

* `BASE_URL`: Specifies the Cloud Run service URL for end-to-end tests.
* `ID_TOKEN`: JWT token used to authenticate with Cloud Run's IAM-based authentication.
* `REGION`: [`us-central1`] Optional override region for the location of the Cloud Run service.
* `SERVICE_NAME`: The name of the deployed service, used in some API calls and test assertions.

## Dependencies

* **express**: Web server framework.
* **got**: [Testing] Used to make HTTP requests of the running service in end-to-end testing.
