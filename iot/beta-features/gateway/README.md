<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS Gateway sample

This sample app demonstrates sending telemetry data on behalf of a device using the Cloud IoT Core gateways.

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

# Running the sample

    Commands:
      createGateway <registryId> <gatewayId> <algorithm> <publicKeyFile>
      listGateways <registryId>
      bindDeviceToGateway <registryId> <gatewayId> <deviceId>
      unbindDeviceFromGateway <registryId> <gatewayId> <deviceId>
      listDevicesForGateway <registryId> <gatewayId>

      listen <deviceId> <gatewayId> <registryId> <privateKeyFile> Listen for config messages on a gateway and device
      relayData <deviceId> <registryId> <privateKeyFile>  Sends data on behalf of a device.

    Options:
      --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                            environment variables.                                                                  [string]
      --serviceAccount, -s  The path to your service credentials JSON.                                              [string]
      --cloudRegion, -c                                                                    [string] [default: "us-central1"]
      --help                Show help                                                                              [boolean]

    Examples:
      node hub.js relayData my-device my-registry "test"

    For more information, see https://cloud.google.com/iot-core/docs

# Notes

By default, gateways use the "Association only" method for authentication, which means the device does not have to store its own JWT. For other authentication methods, check [here for more information](https://cloud.google.com/iot/docs/how-tos/gateways/manage-gateways#authentication_methods).