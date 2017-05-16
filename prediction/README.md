<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Prediction API Node.js Samples

[![Build](https://storage.googleapis.com/cloud-docs-samples-badges/GoogleCloudPlatform/nodejs-docs-samples/nodejs-docs-samples-prediction.svg)]()

The [Cloud Prediction API](https://cloud.google.com/prediction/docs) provides a RESTful API to build Machine Learning models.

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Hosted Models](#hosted-models)
* [Running the tests](#running-the-tests)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

    With **npm**:

        npm install

    With **yarn**:

        yarn install

[prereq]: ../README.md#prerequisites
[run]: ../README.md#how-to-run-a-sample

## Samples

### Hosted Models

View the [documentation][hostedmodels_0_docs] or the [source code][hostedmodels_0_code].

__Usage:__ `node hostedmodels <phrase>`

```
node hostedmodels "Hello world"
```

[hostedmodels_0_docs]: https://cloud.google.com/prediction/docs/developer-guide#predictionfromappengine
[hostedmodels_0_code]: hostedmodels.js

## Running the tests

1.  Set the **GCLOUD_PROJECT** and **GOOGLE_APPLICATION_CREDENTIALS** environment variables.

1.  Run the tests:

    With **npm**:

        npm test

    With **yarn**:

        yarn test
