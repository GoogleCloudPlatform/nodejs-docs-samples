<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS Device Management example

This sample app demonstrates device management for Google Cloud IoT Core.

Note that before you run this sample, you must configure a Google Cloud PubSub
topic for Cloud IoT as described in the parent README.

# Setup

Run the following command to install the library dependencies for NodeJS:

    npm install

# Running the sample

The following command summarizes the sample usage:

      Usage: cloudiot_device_manager_example [options]

      Example Google Cloud IoT device manager integration

      Options:

        -h, --help                                     output usage information
        --project_id <project_id>                      GCP cloud project name.
        --pubsub_topic <pubsub_topic>                  Cloud Pub/Sub topic to use.
        --api_key <api_key>                            Your API key.
        --ec_public_key_file <ec_public_key_file>      Path to EC public key.
        --rsa_certificate_file <rsa_certificate_file>  Path to RSA certificate file.
        --cloud_region <cloud_region>                  GCP cloud region.
        --service_account_json <service_account_json>  Path to service account JSON file.
        --registry_id <registry_id>                    Custom registry id. If not provided, a unique registry id will be generated.

For example, if your project ID is `blue-jet-123`, your service account
credentials are stored in your home folder in creds.json and you have generated
your credentials using the shell script provided in the parent folder, you can
run the sample as:

    node cloudiot_device_manager_example.js \
        --service_account_json=$HOME/creds.json \
        --api_key=YOUR_CLIENT_ID \
        --project_id=blue-jet-123 \
        --pubsub_topic=projects/blue-jet-123/topics/device-events \
        --ec_public_key_file=../ec_public.pem \
        --rsa_certificate_file=../rsa_cert.pem
