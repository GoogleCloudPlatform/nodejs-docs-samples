<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS Send Command sample

This sample app demonstrates sending a command to a IoT Core Device.

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

Place `rsa_cert.pem` and `rsa_private.pem` into the resources directory under `../receive/resources`


# Running the sample

    Commands:
      sendCommand <deviceId> <registryId> <command>  Sends a command to a device.

    Options:
      --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                            environment variables.                                                                  [string]
      --serviceAccount, -s  The path to your service credentials JSON.                                              [string]
      --help                Show help                                                                              [boolean]
      --cloudRegion, -c                                                                    [string] [default: "us-central1"]

    Examples:
      node send.js sendCommand my-device my-registry "test"

    For more information, see https://cloud.google.com/iot-core/docs
