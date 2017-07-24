<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google BigQuery Node.js Samples

[![Build](https://storage.googleapis.com/cloud-docs-samples-badges/GoogleCloudPlatform/nodejs-docs-samples/nodejs-docs-samples-bigquery.svg)]()

[BigQuery](https://cloud.google.com/bigquery/docs) is Google&#x27;s fully managed, petabyte scale, low cost analytics data warehouse. BigQuery is NoOps—there is no infrastructure to manage and you don&#x27;t need a database administrator—so you can focus on analyzing data to find meaningful insights, use familiar SQL, and take advantage of our pay-as-you-go model.

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Datasets](#datasets)
  * [Tables](#tables)
  * [Queries](#queries)
* [Running the tests](#running-the-tests)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

    With **npm**:

        npm install

    With **yarn**:

        yarn install

[prereq]: ../README.md#prerequisites
[run]: ../README.md#how-to-run-a-sample

## Samples

### Datasets

View the [documentation][datasets_0_docs] or the [source code][datasets_0_code].

__Usage:__ `node datasets.js --help`

```
Commands:
  create <datasetId>  Creates a new dataset.
  delete <datasetId>  Deletes a dataset.
  list                Lists datasets.

Options:
  --projectId, -p  The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                   environment variables.                                                                       [string]
  --help           Show help                                                                                   [boolean]

Examples:
  node datasets.js create my_dataset                      Creates a new dataset named "my_dataset".
  node datasets.js delete my_dataset                      Deletes a dataset named "my_dataset".
  node datasets.js list                                   Lists all datasets in the project specified by the
                                                          GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environments variables.
  node datasets.js list --projectId=bigquery-public-data  Lists all datasets in the "bigquery-public-data" project.

For more information, see https://cloud.google.com/bigquery/docs
```

[datasets_0_docs]: https://cloud.google.com/bigquery/docs
[datasets_0_code]: datasets.js

### Tables

View the [documentation][tables_1_docs] or the [source code][tables_1_code].

__Usage:__ `node tables.js --help`

```
Commands:
  create <datasetId> <tableId> <schema>                         Creates a new table.
  list <datasetId>                                              Lists all tables in a dataset.
  delete <datasetId> <tableId>                                  Deletes a table.
  copy <srcDatasetId> <srcTableId> <destDatasetId>              Makes a copy of a table.
  <destTableId>
  browse <datasetId> <tableId>                                  Lists rows in a table.
  import <datasetId> <tableId> <fileName>                       Imports data from a local file into a table.
  import-gcs <datasetId> <tableId> <bucketName> <fileName>      Imports data from a Google Cloud Storage file into a
                                                                table.
  export <datasetId> <tableId> <bucketName> <fileName>          Export a table from BigQuery to Google Cloud Storage.
  insert <datasetId> <tableId> <json_or_file>                   Insert a JSON array (as a string or newline-delimited
                                                                file) into a BigQuery table.

Options:
  --projectId, -p  The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                   environment variables.                                                                       [string]
  --help           Show help                                                                                   [boolean]

Examples:
  node tables.js create my_dataset my_table "Name:string,       Creates a new table named "my_table" in "my_dataset".
  Age:integer, Weight:float, IsMagic:boolean"
  node tables.js list my_dataset                                Lists tables in "my_dataset".
  node tables.js browse my_dataset my_table                     Displays rows from "my_table" in "my_dataset".
  node tables.js delete my_dataset my_table                     Deletes "my_table" from "my_dataset".
  node tables.js import my_dataset my_table ./data.csv          Imports a local file into a table.
  node tables.js import-gcs my_dataset my_table my-bucket       Imports a GCS file into a table.
  data.csv
  node tables.js export my_dataset my_table my-bucket my-file   Exports my_dataset:my_table to gcs://my-bucket/my-file
                                                                as raw CSV.
  node tables.js export my_dataset my_table my-bucket my-file   Exports my_dataset:my_table to gcs://my-bucket/my-file
  -f JSON --gzip                                                as gzipped JSON.
  node tables.js insert my_dataset my_table json_string         Inserts the JSON array represented by json_string into
                                                                my_dataset:my_table.
  node tables.js insert my_dataset my_table json_file           Inserts the JSON objects contained in json_file (one per
                                                                line) into my_dataset:my_table.
  node tables.js copy src_dataset src_table dest_dataset        Copies src_dataset:src_table to dest_dataset:dest_table.
  dest_table

For more information, see https://cloud.google.com/bigquery/docs
```

[tables_1_docs]: https://cloud.google.com/bigquery/docs
[tables_1_code]: tables.js

### Queries

View the [documentation][queries_2_docs] or the [source code][queries_2_code].

__Usage:__ `node queries.js --help`

```
Commands:
  sync <sqlQuery>   Run the specified synchronous query.
  async <sqlQuery>  Start the specified asynchronous query.
  shakespeare       Queries a public Shakespeare dataset.

Options:
  --projectId, -p  The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                   environment variables.                                                                       [string]
  --help           Show help                                                                                   [boolean]

Examples:
  node queries.js sync "SELECT * FROM                           Synchronously queries the natality dataset.
  publicdata.samples.natality LIMIT 5;"
  node queries.js async "SELECT * FROM                          Queries the natality dataset as a job.
  publicdata.samples.natality LIMIT 5;"
  node queries.js shakespeare                                   Queries a public Shakespeare dataset.

For more information, see https://cloud.google.com/bigquery/docs
```

[queries_2_docs]: https://cloud.google.com/bigquery/docs
[queries_2_code]: queries.js

## Running the tests

1.  Set the **GCLOUD_PROJECT** and **GOOGLE_APPLICATION_CREDENTIALS** environment variables.

1.  Run the tests:

    With **npm**:

        npm test

    With **yarn**:

        yarn test
