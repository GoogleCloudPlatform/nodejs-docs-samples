<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS Device Management example

This sample app demonstrates device management for Google Cloud IoT Core.

Note that before you run this sample, you must configure a Google Cloud PubSub
topic for Cloud IoT as described in the parent README.

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

# Running the sample

    Commands:
      createRsa256Device <deviceId> <registryId> <rsaPath>  Creates an RSA256 device.
      createEs256Device <deviceId> <registryId> <esPath>    Creates an ES256 device.
      createUnauthDevice <deviceId> <registryId>            Creates a device without authorization.
      createRegistry <registryId> <pubsubTopic>             Creates a device registry.
      createIotTopic <pubsubTopic>                          Creates and configures a PubSub topic for Cloud IoT Core.
      setupIotTopic <pubsubTopic>                           Configures the PubSub topic for Cloud IoT Core.
      deleteDevice <deviceId> <registryId>                  Deletes a device from the device registry.
      clearRegistry <registryId>                            !!Be careful! Removes all devices and then deletes a device
                                                            registry!!
      deleteRegistry <registryId>                           Deletes a device registry.
      getDevice <deviceId> <registryId>                     Retrieves device info given a device ID.
      listDevices <registryId>                              Lists the devices in a given registry.
      patchEs256 <deviceId> <registryId> <es256Path>        Patches a device with ES256 authorization credentials.
      patchRsa256 <deviceId> <registryId> <rsa256Path>      Patches a device with RSA256 authentication credentials.

    Options:
      --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                            environment variables.                                                                  [string]
      --serviceAccount, -s  The path to your service credentials JSON.                                              [string]
      --help                Show help                                                                              [boolean]
      --cloudRegion, -c                                                                    [string] [default: "us-central1"]

    Examples:
      node manager.js createEs256Device my-es-device my-registry ../ec_public.pem --serviceAccount=$HOME/creds_iot.json
      node manager.js createRegistry my-registry my-iot-topic --serviceAccount=$HOME/creds_iot.json
      --api_key=abc123zz --project_id=my-project-id
      node manager.js createRsa256Device my-rsa-device my-registry ../rsa_cert.pem --serviceAccount=$HOME/creds_iot.json
      node manager.js createUnauthDevice my-device my-registry --serviceAccount=$HOME/creds_iot.json
      node manager.js deleteDevice my-device my-registry --serviceAccount=$HOME/creds_iot.json
      node manager.js deleteRegistry my-device my-registry --serviceAccount=$HOME/creds_iot.json
      node manager.js getDevice my-device my-registry --serviceAccount=$HOME/creds_iot.json
      node manager.js listDevices my-node-registry --serviceAccount=$HOME/creds_iot.json
      node manager.js patchRsa256 my-device my-registry ../rsa_cert.pem --serviceAccount=$HOME/creds_iot.json
      node manager.js patchEs256 my-device my-registry ../ec_public.pem --serviceAccount=$HOME/creds_iot.json
      node manager.js setupTopic my-iot-topic --serviceAccount=$HOME/creds_iot.json
      --project_id=my-project-id

    For more information, see https://cloud.google.com/iot-core/docs
