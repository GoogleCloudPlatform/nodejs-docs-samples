<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions - Hello World sample

See:

* [Cloud Functions Hello World tutorial][tutorial]
* [Cloud Functions Hello World sample source code][code]

[tutorial]: https://cloud.google.com/functions/docs/quickstart
[code]: index.js

## Deploy and run the sample

See the [Cloud Functions Hello World tutorial][tutorial].

## Run the tests

1. Read and follow the [prerequisites](../../../../#prerequisites).

1. Install [Google Cloud Functions Emulator][https://github.com/GoogleCloudPlatform/cloud-functions-emulator] globally, and then run it

        npm install -g @google-cloud/functions-emulator
        functions start

1. Install dependencies:

        npm install

1. Set the following environment variables, note GCF_REGION is the default for the Cloud Functions Emulator.

        GCLOUD_PROJECT
        GCF_REGION=us-central1
        FUNCTIONS_TOPIC
        FUNCTIONS_BUCKET
        GOOGLE_APPLICATION_CREDENTIALS

1. Run the tests:

        npm test
