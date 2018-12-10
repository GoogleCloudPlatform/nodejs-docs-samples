<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS Gateway sample

This sample app demonstrates sending telemetry data on behalf of device using
the a Cloud IoT Core gateway.

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

# Running the sample

    Commands:
      relayData <deviceId> <registryId> <data>  Sends data on behalf of a device.

    Options:
      --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                            environment variables.                                                                  [string]
      --serviceAccount, -s  The path to your service credentials JSON.   [string] [default: "/Users/class/creds_cloud.json"]
      --help                Show help                                                                              [boolean]
      --cloudRegion, -c                                                                    [string] [default: "us-central1"]
      --data, -d                                                                           [string] [default: "us-central1"]

    Examples:
      node hub.js relayData my-device my-registry "test"

    For more information, see https://cloud.google.com/iot-core/docs
