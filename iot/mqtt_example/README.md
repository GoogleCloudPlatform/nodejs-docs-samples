<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS MQTT example

This sample app publishes data to Cloud Pub/Sub using the MQTT bridge provided
as part of Google Cloud IoT Core.

Note that before you can run this sample, you must register a device as
described in the parent README. For the gateway samples, you must register and bind
a device as described in the [Cloud IoT gateway docs](https://cloud.google.com/iot/docs/how-tos/gateways/#setup).

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

# Running the sample

The following command summarizes the sample usage:

    Usage: cloudiot_mqtt_example_nodejs [command] [options]

    Commands:
        mqttDeviceDemo              Example Google Cloud IoT Core MQTT device connection demo.
        sendDataFromBoundDevice     Demonstrates sending data from a gateway on behalf of a bound device.
        listenForConfigMessages     Demonstrates listening for config messages on a gateway client of a bound device.
        listenForErrorMessages      Demonstrates listening for error messages on a gateway.

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
run the following examples:

    node cloudiot_mqtt_example_nodejs.js mqttDeviceDemo \
        --projectId=blue-jet-123 \
        --cloudRegion=us-central1 \
        --registryId=my-registry \
        --deviceId=my-device \
        --privateKeyFile=../rsa_private.pem \
        --algorithm=RS256

    node cloudiot_mqtt_example_nodejs.js sendDataFromBoundDevice \
        --projectId=blue-jet-123 \
        --cloudRegion=us-central1 \
        --registryId=my-registry \
        --gatewayId=my-gateway \
        --deviceId=my-device \
        --privateKeyFile=../rsa_private.pem \
        --algorithm=RS256

    node cloudiot_mqtt_example_nodejs.js listenForConfigMessages \
        --projectId=blue-jet-123 \
        --cloudRegion=us-central1 \
        --registryId=my-registry \
        --gatewayid=my-gateway \
        --deviceId=my-device \
        --privateKeyFile=../rsa_private.pem \
        --algorithm=RS256
        --clientDuration=60000

# Sending a configuration update

For `listenForConfigMessages` example, try sending a config update to the device while the client is running. This can be done via the Google Cloud IoT Core UI or through the command line with the following command.

    gcloud iot devices configs update --region=us-central1 --registry=my-registry --device=my-device --config-data="testing"

# Reading the messages written by the sample client

1. Create a subscription to your topic.

        gcloud pubsub subscriptions create \
            projects/your-project-id/subscriptions/my-subscription \
            --topic device-events

2. Read messages published to the topic

        gcloud pubsub subscriptions pull --auto-ack \
            projects/my-iot-project/subscriptions/my-subscription
