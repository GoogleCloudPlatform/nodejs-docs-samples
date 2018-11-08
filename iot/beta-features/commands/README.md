<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS Command Samples

This folder contains NodeJS samples that demonstrate sending and receiving
commands.

## Quickstart

1.  Install the Google Cloud SDK as described in [the Cloud IoT Core documentation](https://cloud.google.com/iot/docs/how-tos/getting-started#set_up_the_google_cloud_sdk_and_gcloud).
1.  Create a Cloud Pub/Sub topic:

    gcloud pubsub topics create projects/my-iot-project/topics/device-events

1.  Add the service account `cloud-iot@system.gserviceaccount.com` with the role `Publisher` to that
    Cloud Pub/Sub topic from the [Cloud Developer Console](https://console.cloud.google.com)
    or by setting the `GOOGLE_CLOUD_PROJECT` environment variable and using the
    helper script in the `scripts/` folder.

1.  Create a registry:

        gcloud iot registries create my-registry \
            --project=my-iot-project \
            --region=us-central1 \
            --event-pubsub-topic=projects/my-iot-project/topics/device-events

1.  Use the `generate_keys.sh` script to generate your signing keys:

        ./scripts/generate_keys.sh

1.  Create a device.

        gcloud beta iot devices create my-node-device \
            --project=my-iot-project \
            --region=us-central1 \
            --registry=my-registry \
            --public-key path=rsa_cert.pem,type=rs256

1.  Start a receiver using the sample in the `receive` folder.
1.  Send a command using the sample in `send` folder.
