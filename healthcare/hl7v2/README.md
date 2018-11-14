<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Healthcare API Node.js HL7v2 store and HL7v2 message example

This sample app demonstrates HL7v2 store and HL7v2 message management for the Cloud Healthcare API.

# Setup

Run the following command to install the library dependencies for Node.js:

    npm install

# Running the samples

## HL7v2 stores

    hl7v2_stores.js <command>

    Commands:
        hl7v2_stores.js createHl7v2Store <datasetId> <hl7v2StoreId>   Creates a new HL7v2 store within the parent dataset.
        hl7v2_stores.js deleteHl7v2Store <datasetId> <hl7v2StoreId>   Deletes the HL7v2 store and removes all resources that
                                                                      are contained within it.
        hl7v2_stores.js getHl7v2Store <datasetId> <hl7v2StoreId>      Gets the specified HL7v2 store or returns NOT_FOUND if
                                                                      it doesn't exist.
        hl7v2_stores.js listHl7v2Stores <datasetId>                   Lists the HL7v2 stores in the given dataset.
        hl7v2_stores.js patchHl7v2Store <datasetId> <hl7v2StoreId>    Updates the HL7v2 store.
        <pubsubTopic>

    Options:
    --version             Show version number                                                                    [boolean]
    --apiKey, -a          The API key used for discovering the API.
                                                                                                                  [string]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]


## HL7v2 messages

    hl7v2_messages.js <command>

    Commands:
        hl7v2_messages.js createHl7v2Message <datasetId>              Creates a new HL7v2 message and, if configured, sends a
        <hl7v2StoreId> <messageFile>                                  notification to the parent store's Cloud Pub/Sub topic.
        hl7v2_messages.js ingestHl7v2Message <datasetId>              Ingests a new HL7v2 message from the hospital and, if
        <hl7v2StoreId> <messageFile>                                  configured, sends a notification to the Cloud Pub/Sub
                                                                      topic.
        hl7v2_messages.js deleteHl7v2Message <datasetId>              Deletes the specified HL7v2 message.
        <hl7v2StoreId> <messageId>
        hl7v2_messages.js getHl7v2Message <datasetId> <hl7v2StoreId>  Gets the specified HL7v2 message.
        <messageId>
        hl7v2_messages.js listHl7v2Messages <datasetId>               Lists all the messages in the given HL7v2 store.
        <hl7v2StoreId>
        hl7v2_messages.js patchHl7v2Message <datasetId>               Updates the specified HL7v2 message.
        <hl7v2StoreId> <labelKey> <labelValue>

    Options:
    --version             Show version number                                                                    [boolean]
    --apiKey, -a          The API key used for discovering the API.
                                                                                                                  [string]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare/docs
