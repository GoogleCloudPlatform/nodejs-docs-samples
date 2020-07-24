<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Healthcare API Node.js Dataset Management example

This sample app demonstrates dataset management for the Cloud Healthcare API.

# Setup

Run the following command to install the library dependencies for Node.js:

    npm install

# Running the sample

    Commands:
        createDataset.js <projectId> <cloudRegion> <datasetId>                                  Creates a new health dataset.
        deleteDataset.js <projectId> <cloudRegion> <datasetId>                                  Deletes the specified health dataset and all data
                                                                                                contained in the dataset.
        getDataset.js <projectId> <cloudRegion> <datasetId>                                     Gets details about a dataset.
        listDatasets.js <projectId> <cloudRegion>                                               Lists the datasets in the given GCP project.
        patchDataset.js <projectId> <cloudRegion> <datasetId> <timeZone>                        Updates dataset details.
        deidentifyDataset.js <projectId> <cloudRegion> <sourceDatasetId>                        Creates a new dataset containing de-identified data from
        <destinationDatasetId> <keeplistTags>                                                   the source dataset.
        getDatasetIamPolicy.js <projectId> <cloudRegion> <datasetId>                            Gets the IAM policy for the dataset.
        setDatasetIamPolicy.js <projectId> <cloudRegion> <datasetId> <member>                   Sets the IAM policy for the dataset.
        <role>

        Options:
        --version             Show version number                                                                    [boolean]
        --cloudRegion, -c                                                                    [string] [default: "us-central1"]
        --projectId, -p       The Project ID to use. Defaults to the value of the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                              environment variables.                                                                  [string]
        --serviceAccount, -s  The path to your service credentials JSON.
                                             [string]
        --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare/docs
