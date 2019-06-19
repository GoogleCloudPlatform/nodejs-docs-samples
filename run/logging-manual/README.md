# Cloud Run Manual Logging Sample

This sample shows how to send structured logs to Stackdriver Logging.

Read more about Cloud Run logging in the [Logging How-to Guide](http://cloud.google.com/run/docs/logging).

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/run).

## Environment Variables

* `CLOUD_RUN_SERVICE_NAME`: Used in testing to specify the name of the service. The name may be included in API calls and test conditions.
* `CLOUD_RUN_SERVICE_URL`: Used to designate the URL of the Cloud Run service under system test. The URL is not deterministic, so the options are to record it at deploy time or use the Cloud Run API to retrieve the value.
* `GOOGLE_CLOUD_PROJECT`: Used in production as an override to determination of the GCP Project from the GCP metadata server. Used in testing to configure the Logging client library.

## Dependencies

* **express**: Web server framework.
* **got**: Used to pull the project ID of the running service from the [compute metadata server](https://cloud.google.com/compute/docs/storing-retrieving-metadata) and make system test HTTP requests. This is required in production for log correlation without manually setting the $GOOGLE_CLOUD_PROJECT environment variable.

