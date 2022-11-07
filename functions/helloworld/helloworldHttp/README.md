<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions - Hello World HTTP sample

See:

* [Cloud Functions Hello World tutorial][tutorial]
* [Cloud Functions Hello World HTTP sample source code][code]

[tutorial]: https://cloud.google.com/functions/docs/quickstart
[code]: index.js

## Deploy and run the sample

See the [Cloud Functions Hello World tutorial][tutorial].

**Note:** in order for the tests to run properly, you'll have to deploy some of the sample functions:

```
gcloud functions deploy helloHttp --runtime [YOUR_RUNTIME] --trigger-http
```

* Replace `[YOUR_RUNTIME]` with the name of the runtime you are using. For a
complete list, see the [gcloud reference](https://cloud.google.com/sdk/gcloud/reference/functions/deploy#--runtime).

## Run the tests

1. Read and follow the [prerequisites](../../../README.md#prerequisites).


1. Install dependencies:

        npm install

1. Set the following environment variables:

        export GCF_REGION=us-central1

1. Run the tests:

        npm test
