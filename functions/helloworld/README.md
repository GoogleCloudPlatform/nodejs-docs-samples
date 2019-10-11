<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions - Hello World sample

See:

* [Cloud Functions Hello World tutorial][tutorial]
* [Cloud Functions Hello World sample source code][code]

[tutorial]: https://cloud.google.com/functions/docs/quickstart
[code]: index.js

## Deploy and run the sample

See the [Cloud Functions Hello World tutorial][tutorial].

**Note:** in order for the tests to run properly, you'll have to deploy some of the sample functions:

```
gcloud functions deploy helloHttp --runtime nodejs8 --trigger-http
gcloud functions deploy helloPubSub --trigger-topic $FUNCTIONS_TOPIC --runtime nodejs8
gcloud functions deploy helloGCS --runtime nodejs8 --trigger-resource $FUNCTIONS_DELETABLE_BUCKET --trigger-event providers/cloud.storage/eventTypes/object.change
```

## Run the tests

1. Read and follow the [prerequisites](../../../../#prerequisites).


1. Install dependencies:

        npm install

1. Set the following environment variables:

        export GCF_REGION=us-central1
        export FUNCTIONS_TOPIC=[YOUR_PUBSUB_TOPIC]
        export FUNCTIONS_DELETABLE_BUCKET=[YOUR_CLOUD_STORAGE_BUCKET]  # will be deleted by tests!

1. Run the tests:

        npm test
