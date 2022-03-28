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

    Options:
    --version             Show version number                                                                    [boolean]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]


## FHIR resources

    Commands:
        createFhirResource.js <projectId> <cloudRegion> <datasetId>           Creates a FHIR resource.
        <fhirStoreId> <resourceType>
        deleteFhirResource.js <projectId> <cloudRegion> <datasetId>           Deletes a FHIR resource.
        <fhirStoreId> <resourceType> <resourceId>
        deleteFhirResourcePurge.js <projectId> <cloudRegion> <datasetId>      Deletes all historical versions of a FHIR resource.
        <fhirStoreId> <resourceType> <resourceId>
        getFhirResourceHistory.js <projectId> <cloudRegion> <datasetId>       Gets the contents of a version of a FHIR resource by version ID.
        <fhirStoreId> <resourceType> <resourceId> <versionId>
        getFhirResource.js <projectId> <cloudRegion> <datasetId>              Gets a FHIR resource.
        <fhirStoreId> <resourceType> <resourceId>
        getFhirStoreCapabilities.js <projectId> <cloudRegion> <datasetId>     Gets the capabilities statement for a FHIR store.
        <fhirStoreId>
        getPatientEverything.js <projectId> <cloudRegion> <datasetId>         Retrieves all resources in the patient compartment for a Patient resource.
        <fhirStoreId> <patientId>
        listFhirResourceHistory.js <projectId> <cloudRegion> <datasetId>      Lists all the versions of a resource
        <fhirStoreId> <resourceType> <resourceId>                             (including the current version and deleted versions) from the FHIR store.
        searchFhirResourcesGet.js <projectId> <cloudRegion> <datasetId>       Searches for FHIR resources using the GET method.
        <fhirStoreId> <resourceType>
        searchFhirResourcesPost.js <projectId> <cloudRegion> <datasetId>      Searches for FHIR resources using the POST method.
        <fhirStoreId> <resourceType>
        updateFhirResource.js <projectId> <cloudRegion> <datasetId>           Updates the entire contents of a resource.
        <fhirStoreId> <resourceType> <resourceId>
        patchFhirResource.js <projectId> <cloudRegion> <datasetId>            Updates part of a resource.
        <fhirStoreId> <resourceType> <resourceId>
        executeFhirBundle.js <projectId> <cloudRegion> <datasetId>            Executes all the requests in the given Bundle.
        <fhirStoreId> <bundleFile>


    Options:
    --version             Show version number                                                                    [boolean]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare/docs

