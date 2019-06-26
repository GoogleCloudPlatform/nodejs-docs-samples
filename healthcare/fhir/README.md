<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Healthcare API Node.js FHIR store and FHIR resource example

This sample app demonstrates FHIR store and FHIR resource management for the Cloud Healthcare API.

# Setup

Run the following command to install the library dependencies for Node.js:

    npm install

# Running the samples

## FHIR stores

    Commands:
        createFhirStore.js <projectId> <cloudRegion> <datasetId> <fhirStoreId>      Creates a new FHIR store within the parent dataset.
        deleteFhirStore.js <projectId> <cloudRegion> <datasetId> <fhirStoreId>      Deletes the FHIR store and removes all resources that
                                                                                    are contained within it.
        getFhirStore.js <projectId> <cloudRegion> <datasetId> <fhirStoreId>         Gets the specified FHIR store or returns NOT_FOUND if it
                                                                                    doesn't exist.
        listFhirStores.js <projectId> <cloudRegion> <datasetId>                     Lists the FHIR stores in the given dataset.
        patchFhirStore.js <projectId> <cloudRegion> <datasetId> <fhirStoreId>       Updates the FHIR store.
        <pubsubTopic>
        getFhirStoreCapabilities.js <projectId> <cloudRegion> <datasetId>           Gets the capabilities statement for the FHIR store.
        <fhirStoreId>

    Options:
    --version             Show version number                                                                    [boolean]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]


## FHIR resources

    Commands:
        fhir_resources.js createResource <datasetId> <fhirStoreId>    Creates a new resource in a FHIR store.
        <resourceType>
        fhir_resources.js updateResource <datasetId> <fhirStoreId>    Updates an existing resource in a FHIR store.
        <resourceType> <resourceId>
        fhir_resources.js patchResource <datasetId> <fhirStoreId>     Patches an existing resource in a FHIR store.
        <resourceType> <resourceId>
        fhir_resources.js deleteResource <datasetId> <fhirStoreId>    Deletes a FHIR resource or returns NOT_FOUND if it
        <resourceType> <resourceId>                                   doesn't exist.
        fhir_resources.js getResource <datasetId> <fhirStoreId>       Gets a FHIR resource.
        <resourceType> <resourceId>
        fhir_resources.js searchResourcesGet <datasetId>              Searches resources in the given FHIR store using the
        <fhirStoreId> <resourceType>                                  searchResources GET method.
        fhir_resources.js searchResourcesPost <datasetId>             Searches resources in the given FHIR store using the
        <fhirStoreId> <resourceType>                                  _search POST method.
        fhir_resources.js getPatientEverything <datasetId>            Gets all the resources in the patient compartment.
        <fhirStoreId> <resourceId>

    Options:
    --version             Show version number                                                                    [boolean]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare/docs
