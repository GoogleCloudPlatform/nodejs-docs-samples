<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions UUID sample

This sample shows a Google Cloud Function that uses a dependency from NPM, and
is a handy way to generate a v4 UUID from the command-line.

View the [documentation][docs] or the [source code][code].

[docs]: https://cloud.google.com/functions/writing
[code]: index.js

## Deploy

This example deploys the function with an HTTP trigger.

    gcloud alpha functions deploy uuid --bucket <your-bucket-name> --trigger-http

## Test

    gcloud alpha functions call uuid

Running the above command should print a generated UUID.

You can also use `curl` to trigger the function:

    curl -X POST https://<your-project-region>.<your-project-id>.cloudfunctions.net/uuid
