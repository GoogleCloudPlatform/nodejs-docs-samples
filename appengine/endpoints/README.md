# Google Cloud Endpoints sample for Google App Engine

This sample demonstrates how to use Google Cloud Endpoints on Google App Engine Flexible Environment using Node.js.

This sample consists of two parts:

1. The backend
2. The clients

## Running locally

Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

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

Not written yet, try the Python client found [here][python-client].

[python-client]: https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/managed_vms/endpoints
