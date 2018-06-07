<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS HTTP example

This sample app publishes messages to [Google Cloud Pub/Sub](pubsub) or updates
device states using the HTTP bridge provided as part of Google Cloud IoT Core.

Note that before you can run this sample, you must register a device as
described in the parent README.

[pubsub]: https://cloud.google.com/pubsub/docs
# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

# Running the sample

The following command summarizes the sample usage:

Usage: cloudiot_http_example_nodejs [options]

Example Google Cloud IoT Core HTTP device connection code.

Options:

    -h, --help                       output usage information
    --projectId <projectId>          GCP cloud project name.
    --registryId <registryId>        Cloud IoT Core registry id.
    --deviceId <deviceId>            Cloud IoT Core device id.
    --privateKeyFile <key_file>      Path to private key file.
    --algorithm <algorithm>          Encryption algorithm to generate the JWT.
                                     Either RS256 (RSA) or ES256 (Eliptic Curve)
    --cloudRegion [region]           GCP cloud region (e.g. us-central1, europe-west1)
    --numMessages [num]              Number of messages to publish.
    --tokenExpMins [num]             Minutes to JWT token expiration.
    --httpBridgeAddress [address]    HTTP bridge address.
    --messageType [events|state]     The message type to publish.

For example, if your project ID is `blue-jet-123`, your region is
asia-east1, and you have generated your credentials using the shell script
provided in the parent folder, you can run the sample as:

    node cloudiot_http_example.js \
        --cloudRegion=asia-east1 \
        --projectId=blue-jet-123 \
        --registryId=my-registry \
        --deviceId=my-node-device \
        --privateKeyFile=../rsa_private.pem \
        --algorithm=RS256

# Reading Cloud Pub/Sub messages written by the sample client

1.  Create a subscription to your topic.

    gcloud beta pubsub subscriptions create \
    projects/your-project-id/subscriptions/my-subscription \
    --topic device-events

2.  Read messages published to the topic

    gcloud beta pubsub subscriptions pull --auto-ack \
    projects/my-iot-project/subscriptions/my-subscription
