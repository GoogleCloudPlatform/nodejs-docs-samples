# Google Cloud Functions message sample

This sample shows calling the `success` and `failure` callbacks.

## Deploy sample

This example deploys the function with an HTTP trigger.

```
gcloud alpha functions deploy helloworld --bucket <your-bucket-name> --trigger-http
```

## Test the function

```
gcloud alpha functions call helloworld
```

You can also use `curl` to trigger the function:

    curl -X POST https://<your-project-region>.<your-project-id>.cloudfunctions.net/helloworld --data '{"message":"cat"}'
