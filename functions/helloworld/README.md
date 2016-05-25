<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Hello World sample

This is a basic hello world sample that shows a single exported function.

View the [documentation][docs] or the [source code][code].

[docs]: https://cloud.google.com/functions/writing
[code]: index.js

## Deploy

This example deploys the function with an HTTP trigger.

    gcloud alpha functions deploy helloworld --bucket <your-bucket-name> --trigger-http

## Test

    gcloud alpha functions call helloworld

Running the above command should print "Hello World!".

You can also use `curl` to trigger the function:

    curl -X POST https://<your-project-region>.<your-project-id>.cloudfunctions.net/helloworld
