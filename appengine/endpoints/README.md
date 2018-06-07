# Google Cloud Endpoints sample for Google App Engine flexible environment

This sample demonstrates how to use Google Cloud Endpoints on Google App Engine
flexible environment using Node.js.

## Running locally

Refer to the [appengine/README.md](../README.md) file for instructions on
running locally.

## Deploying to Google App Engine

Open the `openapi.yaml` file and in the `host` property, replace
`YOUR-PROJECT-ID` with your project's ID.

Then, deploy the sample using `gcloud`:

    gcloud beta app deploy

Once deployed, you can access the application at https://YOUR-PROJECT-ID.appspot.com/.

## Send an echo request

Choose your local or production server:

```
# If you're running locally, you won't need an API key.
$ export ENDPOINTS_HOST=http://localhost:8080

$ export ENDPOINTS_HOST=https://PROJECT-ID.appspot.com
$ export ENDPOINTS_KEY=AIza...
```

Send the request:

```
$ curl -vv -d '{"message":"foo"}' -H 'Content-Type: application/json' "${ENDPOINTS_HOST}/echo?key=${ENDPOINTS_KEY}"
```

If you're running locally, you won't need an API key.

## Sending authenticated requests

No Node.js client is written yet, but you can try the Python client found [here][python-client].
It will send authenticated JWT requests using a Google Cloud service account, or using a three-legged OAuth flow.

[python-client]: https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/managed_vms/endpoints
