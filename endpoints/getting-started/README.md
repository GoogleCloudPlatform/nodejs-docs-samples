# Google Cloud Endpoints sample for Node.js

This sample demonstrates how to use Google Cloud Endpoints using Node.js.

For a complete walkthrough showing how to run this sample in different
environments, see the
[Google Cloud Endpoints Quickstarts](https://cloud.google.com/endpoints/docs/quickstarts).

## Running locally

Refer to the [appengine/README.md](../../appengine/README.md) file for
instructions on running locally.

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

[python-client]: https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/endpoints/getting-started
