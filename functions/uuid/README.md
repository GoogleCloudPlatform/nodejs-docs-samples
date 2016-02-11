# Google Cloud Functions UUID sample

This sample shows a Google Cloud Function that uses a dependency from NPM, and
is a handy way to generate a v4 UUID from the command-line.

## Deploy sample

This example deploys the function with an HTTP trigger.

```
gcloud alpha functions deploy uuid --bucket <your-bucket-name> --trigger-http
```

## Test the function

```
gcloud alpha functions call uuid
```

Running the above command should print a generated UUID.

You can also use `curl` to trigger the function:

    curl -X POST https://<your-project-region>.<your-project-id>.cloudfunctions.net/uuid
