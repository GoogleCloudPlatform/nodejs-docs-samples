<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Healthcare API Node.js Dataset Management example

This sample app demonstrates dataset management for the Cloud Healthcare API.

# Setup

Run the following command to install the library dependencies for Node.js:

    npm install

# Running the sample

    Commands:
        datasets.js createDataset <datasetId>                         Creates a new health dataset.
        datasets.js deleteDataset <datasetId>                         Deletes the specified health dataset and all data
                                                                contained in the dataset.
        datasets.js getDataset <datasetId>                            Gets any metadata associated with a dataset.
        datasets.js listDatasets                                      Lists the datasets in the given GCP project.
        datasets.js patchDataset <datasetId> <timeZone>               Updates dataset metadata.
        datasets.js deidentifyDataset <sourceDatasetId>               Creates a new dataset containing de-identified data from
        <destinationDatasetId> <whitelistTags>                        the source dataset.

        Options:
        --version             Show version number                                                                    [boolean]
         --apiKey, -a          The API key used for discovering the API. Defaults to
                               the value of API_KEY environment variable.
                                                                   [string]
        --cloudRegion, -c                                                                    [string] [default: "us-central1"]
        --projectId, -p       The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                                environment variables.                                    [string]
        --serviceAccount, -s  The path to your service credentials JSON.
                                             [string]
        --help                Show help                                                                              [boolean]

For more information, see https://cloud.google.com/healthcare/docs
