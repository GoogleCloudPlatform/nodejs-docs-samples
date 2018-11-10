<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Healthcare API Node.js DICOM store and DICOMweb example

This sample app demonstrates DICOM store management and the DICOMweb implementation for the Cloud Healthcare API.

# Setup

Run the following command to install the library dependencies for Node.js:

    npm install

# Running the samples

## DICOM stores

    dicom_stores.js <command>

    Commands:
        dicom_stores.js createDicomStore <datasetId> <dicomStoreId>   Creates a new DICOM store within the parent dataset.
        dicom_stores.js deleteDicomStore <datasetId> <dicomStoreId>   Deletes the DICOM store and removes all resources that
                                                                      are contained within it.
        dicom_stores.js getDicomStore <datasetId> <dicomStoreId>      Gets the specified DICOM store or returns NOT_FOUND if
                                                                      it doesn't exist.
        dicom_stores.js listDicomStores <datasetId>                   Lists the DICOM stores in the given dataset.
        dicom_stores.js patchDicomStore <datasetId> <dicomStoreId>    Updates the DICOM store.
        <pubsubTopic>
        dicom_stores.js importDicomObject <datasetId> <dicomStoreId>  Imports data into the DICOM store by copying it from the
        <contentUri>                                                  specified source.
        dicom_stores.js exportDicomInstanceGcs <datasetId>            Exports data to a Cloud Storage bucket by copying it
        <dicomStoreId> <uriPrefix>                                    from the DICOM store.

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


## DICOMweb

    dicomweb.js <command>

    Commands:
        dicomweb.js dicomWebStoreInstance <datasetId> <dicomStoreId>  Handles the POST requests specified in the DICOMweb
        <dcmFile> <boundary>                                          standard.
        dicomweb.js dicomWebSearchInstances <datasetId>               Handles the GET requests specified in the DICOMweb
        <dicomStoreId>                                                standard.
        dicomweb.js dicomWebRetrieveStudy <datasetId> <dicomStoreId>  Handles the GET requests specified in the DICOMweb
        <studyUid>                                                    standard.
        dicomweb.js dicomWebDeleteStudy <datasetId> <dicomStoreId>    Handles DELETE requests.
        <studyUid>

    Options:
    --version             Show version number                                                                    [boolean]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare/docs
