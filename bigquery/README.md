## BigQuery Samples

These samples require two environment variables to be set:

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to a service account file. You can
download one from your Google project's "permissions" page.
- `GCLOUD_PROJECT` - Id of your Google project.

## Run the samples

Install dependencies:

    npm install

### getting_started.js

    npm run getting_started

### dataset_size.js

Usage: `npm run dataset_size -- <projectId> <datasetId>`

Example:

    npm run dataset_size -- bigquery-public-data hacker_news

### load_data_from_csv.js

Usage: `npm run load_data_from_csv -- <path-to-file> <dataset-id> <table-name>`

Example:

    npm run load_data_from_csv -- data.csv my-dataset my-table

### load_data_from_gcs.js

Usage: `npm run load_data_from_gcs -- <bucket-name> <filename> <dataset-id> <table-name>`

Example:

    npm run load_data_from_gcs -- my-bucket data.csv my-dataset my-table
