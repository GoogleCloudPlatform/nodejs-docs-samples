<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Healthcare API Node.js Consent Store Management example

This sample app demonstrates consent store management for the Cloud Healthcare API.

# Setup

Run the following command to install the library dependencies for Node.js:

    npm install

# Running the sample

    Commands:
        createConsentStore.js <projectId> <cloudRegion> <datasetId> <consentStoreId>                     Creates a new consent store.
        deleteConsentStore.js <projectId> <cloudRegion> <datasetId> <consentStoreId>                     Deletes the specified consent store and all data
                                                                                                         contained in the consent store.
        getConsentStore.js <projectId> <cloudRegion> <datasetId> <consentStoreId>                        Gets details about a consent store.
        listConsentStores.js <projectId> <cloudRegion> <datasetId>                                       Lists the consent stores in the given dataset.
        patchConsentStore.js <projectId> <cloudRegion> <datasetId> <consentStoreId>  <defaultConsentTtl> Updates consent store details.
        getConsentStoreIamPolicy.js <projectId> <cloudRegion> <datasetId> <consentStoreId>               Gets the IAM policy for the consent store.
        setConsentStoreIamPolicy.js <projectId> <cloudRegion> <datasetId> <consentStoreId>  <member>     Sets the IAM policy for the consent store.
        <role>

        Options:
        --version             Show version number                                                                    [boolean]
        --cloudRegion, -c                                                                    [string] [default: "us-central1"]
        --projectId, -p       The Project ID to use. Defaults to the value of the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                              environment variables.                                                                  [string]
        --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare-api/docs

