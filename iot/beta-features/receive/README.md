<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS Command Receiver

This sample app receives commands from Cloud IoT Core.

Note that before you can run this sample, you must register a device as
described in the parent README.

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

Place `rsa_cert.pem` and `rsa_private.pem` into the resources directory under `receive/resources`

# Running the sample

The following command summarizes the sample usage:

    Google Cloud IoT Core MQTT example.
    Options:
      --projectId           The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                            environment variables.                                                                  [string]
      --cloudRegion         GCP cloud region.                                              [string] [default: "us-central1"]
      --registryId          Cloud IoT registry ID.                                                       [string] [required]
      --deviceId            Cloud IoT device ID.                                                         [string] [required]
      --privateKeyFile      Path to private key file.                                                    [string] [required]
      --algorithm           Encryption algorithm to generate the JWT.        [string] [required] [choices: "RS256", "ES256"]
      --tokenExpMins        Minutes to JWT token expiration.                                          [number] [default: 20]
      --mqttBridgeHostname  MQTT bridge hostname.                                  [string] [default: "mqtt.googleapis.com"]
      --mqttBridgePort      MQTT bridge port.                                                       [number] [default: 8883]
      --help                Show help                                                                              [boolean]

    Examples:
      node receive.js --projectId=blue-jet-123 \
      --registryId=my-registry --deviceId=my-node-device \
      --privateKeyFile=../rsa_private.pem --algorithm=RS256 \
      --cloudRegion=us-central1

    For more information, see https://cloud.google.com/iot-core/docs
