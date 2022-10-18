# How to become a contributor and submit your own code

This repository contains samples that the documentation on [Google Cloud Platform ][cloud] references. Samples for a client library should be added to the client repository, not this repository. (For example, the `functions` folder is reserved for samples used in [cloud.google.com/functions](https://cloud.google.com/functions)). If you wrote a great sample but it is not used in Google's official documentation, there are better suited places to publish it such as a [community tutorial](https://cloud.google.com/community/).

## Run the tests for a single sample

1. Obtain authentication credentials. Depending on the sample, you
need to enable the appropriate APIs in the [Cloud Console](https://console.cloud.google.com/apis/library).

        gcloud auth application-default login

1. Change directory to one of the sample folders, e.g. `datastore`.

        cd datastore/

1. Install the dependencies.

        npm install

1. Run the tests.

        npm test


## Adding new samples

All samples must have tests. We use `mocha` as testing framework. The package.json file within your sample directory must contain a test script that executes the `mocha` tests via `npm test` ([example](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/batch/package.json#L13)).

A GitHub Actions workflow should be created to run your tests on the CI system:

1. Add an entry to [.github/workflows/workflows.json](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/.github/workflows/workflows.json) matching the directory with your sample code.

1. From the root of the repo, use generate a new workflow in the [workflows](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/.github/workflows) directory.

        node .github/workflows/generate.js


### Style

The [Google Cloud Samples Style Guide][style-guide] is considered the primary
guidelines for all Google Cloud samples. 

[style-guide]: https://googlecloudplatform.github.io/samples-style-guide/

Samples in this repository also follow the JavaScript coding standards. See instructions below to run the linter to match our JavaScript coding standards:

1. Install dependencies at the root of the `nodejs-docs-samples`
directory.

        npm install

1. Run the linter for all samples, including the ones you're adding.

        npm run lint

[cloud]: https://cloud.google.com/

## Failing CI
`Required` tests need to pass. Tests that are not required are expected to fail, they are usually work in progress.
