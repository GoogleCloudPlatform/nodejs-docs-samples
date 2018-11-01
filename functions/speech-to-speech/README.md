# Speech-to-Speech Translation Sample

The Speech-to-Speech Translation sample uses the [Speech-to-Text][1],
[Translation][2], and [Text-to-Speech][3] APIs to translate an audio message to
another language. The sample uses [Google Cloud Functions][4] to wrap up the
calls to the APIs to show how you can incrementally add features to your
existing apps, whether they're hosted on Google Cloud Platform or not.
The sample receives the input audio message as b64-encoded text and drops the
translated audio messages to [Google Cloud Storage][5] where existing apps can
retrieve them.

## Prerequisites

Before using the sample app, make sure that you have the following
prerequisites:

* A [Google Cloud Platform][0] (GCP) account with the following APIs enabled:
  * Cloud Speech API
  * Cloud Text-to-Speech API
  * Cloud Translation API
* An API key file for a service account that has permissions to use the APIs
  mentioned in the previous prerequisite. For more information, see [Using API
  Keys][8].
* [Node Version Manager][6] (NVM)

## Configuring the sample

To configure the sample you must declare the required environment variables, set
up NVM, and install the [Cloud Functions Node.js emulator][7].

The sample requires the following environment variables:

* `GCF_REGION`: The region where your Cloud Function is deployed. For available
  regions, see [Cloud Functions Locations][11] in the Functions documentation.
* `GOOGLE_CLOUD_PROJECT`: The project id of your GCP project.
* `BASE_URL`: The URL that the Cloud Functions emulator uses to serve requests.
* `OUTPUT_BUCKET`: A bucket that the sample uses to drop translated files. The
  test script creates this buckt if it doesn't exist.
* `GOOGLE_APPLICATION_CREDENTIALS`: The path to your API key file.
* `SUPPORTED_LANGUAGE_CODES`: Comma-separated list of languages that the sample
  translates messages to.

Use the following commands to declare the required environment variables:

```
export GCF_REGION=us-central1
export GOOGLE_CLOUD_PROJECT=[your-GCP-project-id]
export BASE_URL=http://localhost:8010/$GOOGLE_CLOUD_PROJECT/$GCF_REGION
export OUTPUT_BUCKET=[your-Google-Cloud-Storage-bucket]
export GOOGLE_APPLICATION_CREDENTIALS=[path-to-your-API-key-file]
export SUPPORTED_LANGUAGE_CODES=en,es,fr
```

The sample includes an `.nvmrc` file that declares the version of Node.js that
you should use to run the app.
Run the following commands to set up NVM to work with the Node.js version
declared in the `.nvmrc` file:

```
nvm install && nvm use
```

Run the following commands to install and start the Cloud Functions emulator:

```
npm install -g @google-cloud/functions-emulator
functions-emulator start
```

## Running the tests

The test script performs the following tasks:

1. Runs the linter.
1. Deploys the function to the emulator.
1. Runs tests that don't perform any calls to the Google Cloud APIs.
1. Creates the output bucket if it doesn't exist.
1. Runs tests that perform calls to the Google Cloud APIs and drop the
   translated messages to the bucket.
1. Deletes the files created during the tests.

To run the tests, use the following commands from the
`functions/speech-to-speech` folder:

```
npm install && npm test
```

## Sending a request to the emulator

Once the tests have run, you can send a request to the emulator using an HTTP
tool, such as [curl][10]. Before sending a request, make sure that the
`OUTPUT_BUCKET` environment variable points to an existing bucket. If you update
the environment variables, you must restart the emulator to apply the new
values. Use the following commands to restart the emulator:

```
functions-emulator restart
```

The sample includes a `test/request-body.json` file that includes a JSON object
that represents the body of a valid request, including the base64-encoded audio
message. Run the following command to send a request to the emulator:

```
curl --request POST --header "Content-Type:application/json" \
--data @test/request-body.json $BASE_URL/speechTranslate
```

The command returns a JSON object with information about the translated message.
You can also see the logs using the following command:

```
functions-emulator logs read
```

[0]: https://cloud.google.com
[1]: https://cloud.google.com/speech-to-text/
[2]: https://cloud.google.com/translate/
[3]: https://cloud.google.com/text-to-speech/
[4]: https://cloud.google.com/functions/
[5]: https://cloud.google.com/storage/
[6]: https://github.com/creationix/nvm
[7]: https://cloud.google.com/functions/docs/emulator
[8]: https://cloud.google.com/docs/authentication/api-keys
[10]: https://curl.haxx.se/
[11]: https://cloud.google.com/functions/docs/locations
