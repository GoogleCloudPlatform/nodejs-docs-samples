# Google Cloud Functions module sample

This sample shows exporting a Google Cloud Function as part of a module, which
is the method one would use to store multiple function in a single source file.

## Deploy sample

This example deploys the function with an HTTP trigger.

```
gcloud alpha functions deploy helloworld --bucket <your-bucket-name> --trigger-http
```

## Test the function

```
gcloud alpha functions call helloworld
```

Running the above command should print "Hello World!".

You can also use `curl` to trigger the function:

    curl -X POST https://<your-project-region>.<your-project-id>.cloudfunctions.net/helloworld