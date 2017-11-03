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

    -h, --help                         output usage information
    --project_id <project_id>          GCP cloud project name.
    --registry_id <registry_id>        Cloud IoT Core registry id.
    --device_id <device_id>            Cloud IoT Core device id.
    --private_key_file <key_file>      Path to private key file.
    --algorithm <algorithm>            Encryption algorithm to generate the JWT.
                                       Either RS256 (RSA) or ES256 (Eliptic Curve)
    --cloud_region [region]            GCP cloud region
    --num_messages [num]               Number of messages to publish.
    --token_exp_mins [num]             Minutes to JWT token expiration.
    --http_bridge_address [address]    HTTP bridge address.
    --message_type [events|state]      The message type to publish.

For example, if your project ID is `blue-jet-123`, your service account
credentials are stored in your home folder in creds.json and you have generated
your credentials using the shell script provided in the parent folder, you can
run the sample as:

    node cloudiot_http_example_nodejs.js \
        --project_id=blue-jet-123 \
        --registry_id=my-registry \
        --device_id=my-node-device \
        --private_key_file=../rsa_private.pem \
        --algorithm=RS256

# Reading Cloud Pub/Sub messages written by the sample client

1.  Create a subscription to your topic.

    gcloud beta pubsub subscriptions create \
    projects/your-project-id/subscriptions/my-subscription \
    --topic device-events

2.  Read messages published to the topic

    gcloud beta pubsub subscriptions pull --auto-ack \
    projects/my-iot-project/subscriptions/my-subscription
