<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google BigQuery Node.js Samples

[BigQuery][bigquery_docs] is Google's fully managed, petabyte scale, low cost
analytics data warehouse.

[bigquery_docs]: https://cloud.google.com/bigquery/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Create A Simple Application With the API](#create-a-simple-application-with-the-api)
  * [Calculate size of dataset](#calculate-size-of-dataset)
  * [Loading Data with a POST Request](#loading-data-with-a-post-request)
  * [Loading Data from Cloud Storage](#loading-data-from-cloud-storage)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Create A Simple Application With the API

View the [documentation][basics_1] or the [source code][basics_2].

__Run the sample:__

    node getting_started

[basics_1]: getting_started.js
[basics_2]: https://cloud.google.com/bigquery/create-simple-app-api

### Calculate size of dataset

View the [source code][size_1].

__Run the sample:__

Usage: `node dataset_size <projectId> <datasetId>`

Example:

    node dataset_size bigquery-public-data hacker_news

[size_1]: dataset_size.js

### Loading Data with a POST Request

View the [documentation][file_1] or the [source code][file_2].

__Run the sample:__

Usage: `node load_data_from_csv <path-to-file> <dataset-id> <table-name>`

Example:

    node load_data_from_csv resources/data.csv my-dataset my-table

[file_1]: load_data_from_csv.js
[file_2]: https://cloud.google.com/bigquery/loading-data-post-request

### Loading Data from Cloud Storage

View the [documentation][gcs_1] or the [source code][gcs_2].

__Run the sample:__

Usage: `node load_data_from_gcs <bucket-name> <filename> <dataset-id> <table-name>`

Example:

    node load_data_from_gcs my-bucket data.csv my-dataset my-table

[gcs_1]: load_data_from_gcs.js
[gcs_2]: https://cloud.google.com/bigquery/docs/loading-data-cloud-storage
