<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS MQTT example

This sample app publishes data to Cloud Pub/Sub using the MQTT bridge provided
as part of Google Cloud IoT Core.

Note that before you can run this sample, you must register a device as
described in the parent README.

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

# Running the sample

The following command summarizes the sample usage:

  Usage: cloudiot_mqtt_example_nodejs [options]

  Example Google Cloud IoT Core MQTT device connection code.

  Options:

    --projectId           The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.
    --cloudRegion         GCP cloud region.
    --registryId          Cloud IoT registry ID.
    --deviceId            Cloud IoT device ID.
    --privateKeyFile      Path to private key file.
    --algorithm           Encryption algorithm to generate the JWT.
    --numMessages         Number of messages to publish.
    --tokenExpMins        Minutes to JWT token expiration.
    --mqttBridgeHostname  MQTT bridge hostname.
    --mqttBridgePort      MQTT bridge port.
    --messageType         Message type to publish.
    --help                Show help


For example, if your project ID is `blue-jet-123`, your service account
credentials are stored in your home folder in creds.json and you have generated
your credentials using the shell script provided in the parent folder, you can
run the sample as:

    node cloudiot_mqtt_example_nodejs.js \
        --projectId=blue-jet-123 \
        --cloudRegion=us-central1 \
        --registryId=my-registry \
        --deviceId=my-node-device \
        --privateKeyFile=../rsa_private.pem \
        --algorithm=RS256

# Reading the messages written by the sample client

1. Create a subscription to your topic.

    gcloud beta pubsub subscriptions create \
        projects/your-project-id/subscriptions/my-subscription \
        --topic device-events

2. Read messages published to the topic

    gcloud beta pubsub subscriptions pull --auto-ack \
        projects/my-iot-project/subscriptions/my-subscription
