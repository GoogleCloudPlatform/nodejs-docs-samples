## Prediction API Samples

These samples require an environment variable to be set:

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to a service account file. You can
download one from your Google project's "permissions" page.

## Run a sample

Install dependencies:

    npm install

To print available commands:

    npm run

Execute a sample:

    npm run <sample>

Example:

    npm run hostedmodels -- "good evening"

- Hosted Models sample - [Source code][predictionapi_1] | [Documentation][predictionapi_2]

[predictionapi_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/prediction/hostedmodels.js
[predictionapi_2]: https://cloud.google.com/prediction/docs/developer-guide#predictionfromappengine