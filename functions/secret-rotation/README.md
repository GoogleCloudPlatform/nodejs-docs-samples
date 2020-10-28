<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Secret Rotation sample

This sample shows you how add new secret versions from cloud functions.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/secret-rotation

1. Create a Secret:

        gcloud secrets create SECRET_ID \
            --replication-policy="automatic"

1. Create a Topic:

        gcloud pubsub topics create TOPID_ID

1. Create a Cloud Scheduler Job:

        gcloud scheduler jobs create pubsub JOB_ID \
            --schedule "0 9 * * 1" \
            --topic TOPIC_ID \
            --message-body "projects/PROJECT_ID/secrets/SECRET_ID"

    This job will run every Monday at 09:00. The body of the message will be the name of the secret to rotate.

1. Create a service account for secret rotation:

        gcloud iam service-accounts create SERVICE_ACCOUNT_ID

1. Grant the function the necessary permissions on the secret:

        gcloud secrets add-iam-policy-binding SECRET_ID \
            --member="serviceAccount:SERVICE_ACCOUNT_ID@PROJECT_ID.iam.gserviceaccount.com" \
            --role="roles/secretmanager.secretVersionAdder"

1. Deploy the `rotate` function with a Pub/Sub trigger:

        gcloud functions deploy FUNCTION_ID \
            --runtime nodejs10 \
            --trigger-topic TOPIC_ID \
            --entry-point subscribe \
            --set-env-vars SECRET_NAME=projects/PROJECT_ID/secrets/SECRET_ID \
            --max-instances=1 \
            --retry \
            --service-account SERVICE_ACCOUNT_ID@PROJECT_ID.iam.gserviceaccount.com

1. Manually trigger the scheduled job:

        gcloud scheduler jobs run JOB_ID

    A new secret version should be then added to SECRET_ID.
