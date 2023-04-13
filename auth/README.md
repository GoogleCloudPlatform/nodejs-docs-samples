# Getting Started with Google Cloud Authentication

[![Open in Cloud Shell][shell_img]][shell_link]

[shell_img]: http://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=auth/README.md

## Auth with Cloud Client

See the [documentation][auth-docs] for more information about authenticating for Google Cloud APIs.

[auth-docs]: https://cloud.google.com/docs/authentication/production

1. Install dependencies from `package.json`

        $ npm install

2. Set the environment variable `GOOGLE_CLOUD_PROJECT` to the project ID, set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the credential you're using,
and set the environment variable `BUCKET_NAME` to a bucket you created in the project.

3. To run the individual auth.js test, you can do:

        $ npm run test:auth

## Downscoping with Credential Access Boundaries

This section contains samples for
[Downscoping with Credential Access Boundaries](https://cloud.google.com/iam/docs/downscoping-short-lived-credentials).

### Running the samples

1. Your environment must be setup with [authentication
information](https://developers.google.com/identity/protocols/application-default-credentials#howtheywork). If you're running on Cloud Shell or Compute Engine, this is already setup. You can also use `gcloud auth application-default login`.

2. Install dependencies from `package.json`

        $ npm install

3. Set the environment variable `GOOGLE_CLOUD_PROJECT` to the project ID.

4. To run the individual downscoping.js test, you can do:

        $ npm run test:downscoping

### Additional resources

For more information on downscoped credentials you can visit:

> https://github.com/googleapis/google-auth-library-nodejs