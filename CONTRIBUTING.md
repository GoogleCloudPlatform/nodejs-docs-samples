# How to become a contributor and submit your own code

This repository contains samples that the documentation on [Google Cloud Platform ][cloud] references. If you wrote a great sample but it is not used in Google's official documentation, there are better suited places to publish it such as a [community tutorial](https://cloud.google.com/community/). 

## Run the tests for a single sample

1. Obtain authentication credentials. Depending on the sample, you 
need to enable the appropriate APIs in the [Cloud Console](https://console.cloud.google.com/apis/library).

        gcloud auth application-default login

1. Change directory to one of the sample folders, e.g. `storage-transfer`.

        cd storage-transfer/

1. Install the dependencies. 

        npm install

1. Run the tests.

        npm test


## Adding new samples

All samples must have tests. We use `mocha` as testing framework. 

Add a **build configuration file (`.cfg`)** for your samples in **[`.kokoro/`](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/.kokoro)**. Check existing config files for the right format.

All tests need a corresponding job file outside of GitHub. If you are a Googler, please provide the CL alongside your PR. See the internal codelab for Kokoro for details. If you don't work at Google, the person reviewing your PR will create the job config for you. 

### Style

1. Install dependencies at the root of the `nodejs-docs-samples`
directory.

        npm install

1. Run the linter for all samples, including the ones you're adding, to match our JavaScript coding standards.

        npm run lint

[cloud]: https://cloud.google.com/
