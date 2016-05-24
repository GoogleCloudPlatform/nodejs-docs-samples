## Storage Samples

These samples require an environment variable to be set:

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to a service account file. You can
download one from your Google project's "permissions" page.

## Run a sample

Install dependencies:

    npm install

To print available commands:

    npm run

Execute a sample:

    npm run <sample> -- [args...]

Example:

    npm run authSample -- my-cool-project


- Auth sample - [Source code][storage_1] | [Documentation][storage_2]

[storage_1]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/storage/authSample.js
[storage_2]: https://cloud.google.com/storage/docs/authentication#acd-examples