<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Healthcare API Node.js DICOM store and DICOMweb example

This sample app demonstrates DICOM store management and the DICOMweb implementation for the Cloud Healthcare API.

# Setup

Run the following command to install the library dependencies for Node.js:

    npm install

# Running the samples

## DICOM stores

    Commands:
        node createDicomStore.js <projectId> <cloudRegion> <datasetId> <dicomStoreId>   Creates a new DICOM store within the parent dataset.
        node deleteDicomStore.js <projectId> <cloudRegion> <datasetId> <dicomStoreId>   Deletes the DICOM store and removes all resources that
                                                                                        are contained within it.
        node getDicomStore.js <projectId> <cloudRegion> <datasetId> <dicomStoreId>      Gets the specified DICOM store or returns NOT_FOUND if
                                                                                        it doesn't exist.
        node listDicomStores.js <projectId> <cloudRegion> <datasetId>                   Lists the DICOM stores in the given dataset.
        node patchDicomStore.js <projectId> <cloudRegion> <datasetId> <dicomStoreId>    Updates the DICOM store.
        <pubsubTopic>
        node importDicomInstance.js <projectId> <cloudRegion> <datasetId>               Imports data into the DICOM store by copying it from the
        <dicomStoreId> <gcsUri>                                                         specified source.
        node exportDicomInstanceGcs.js <projectId> <cloudRegion> <datasetId>            Exports data to a Cloud Storage bucket by copying it
        <dicomStoreId> <uriPrefix>                                                      from the DICOM store.
        node getDicomStoreIamPolicy.js <projectId>                                      Gets the IAM policy for the HL7v2 store.
        <cloudRegion> <datasetId> <dicomStoreId>
        node setDicomStoreIamPolicy.js <projectId>                                      Sets the IAM policy for the HL7v2store.
        <cloudRegion> <datasetId> <dicomStoreId> <member> <role>

    Options:
    --version             Show version number                                                                    [boolean]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]


## DICOMweb

    Commands:
        dicomweb.js dicomWebStoreInstance <datasetId> <dicomStoreId>  Handles the POST requests specified in the DICOMweb
        <dcmFile>                                                     standard.
        
        node dicomWebSearchForInstances.js <projectId> <cloudRegion>  Handles the GET requests specified in the DICOMweb
        <datasetId> <dicomStoreId>                                    standard.
        
        node dicomWebRetrieveStudy.js <projectId> <cloudRegion>       Handles the GET requests specified in the DICOMweb
        <datasetId> <dicomStoreId> <studyUid>                         standard.
        
        node dicomWebRetrieveInstance.js <projectId> <cloudRegion>    Handles the GET requests specified in the DICOMweb
        <datasetId> <dicomStoreId> <studyUid> <seriesUid>             standard.
        <instanceUid>                        
        
        node dicomWebRetrieveRendered.js <projectId> <cloudRegion>    Handles the GET requests specified in the DICOMweb
        <datasetId> <dicomStoreId> <studyUid> <seriesUid>             standard.
        <instanceUid>                       

        node dicomWebSearchStudies.js <projectId> <cloudRegion>       Searches studies using DICOM tags.
        <datasetId> <dicomStoreId>

        node dicomWebDeleteStudy.js <projectId> <cloudRegion>         Handles DELETE requests.
        <datasetId> <dicomStoreId>  <studyUid>       
       

    Options:
    --version             Show version number                                                                    [boolean]
    --cloudRegion, -c                                                                    [string] [default: "us-central1"]
    --projectId, -p       The Project ID to use. Defaults to the value of the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                          environment variables.                                                                  [string]
    --serviceAccount, -s  The path to your service credentials JSON.
                                                                                                                  [string]
    --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare/docs
