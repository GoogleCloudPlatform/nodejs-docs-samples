<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google BigQuery Node.js Samples

[BigQuery][bigquery_docs] is Google's fully managed, petabyte scale, low cost
analytics data warehouse.

[bigquery_docs]: https://cloud.google.com/bigquery/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Datasets](#datasets)
  * [Queries](#queries)
  * [Tables](#tables)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Datasets

View the [documentation][datasets_docs] or the [source code][datasets_code].

__Usage:__ `node datasets --help`

```
Commands:
  create <datasetId>  Create a new dataset with the specified ID.
  delete <datasetId>  Delete the dataset with the specified ID.
  list                List datasets in the specified project.
  size <datasetId>    Calculate the size of the specified dataset.

Options:
  --projectId, -p  Optionally specify the project ID to use.                   [string] [default: "nodejs-docs-samples"]
  --help           Show help                                                                                   [boolean]

Examples:
  node datasets create my_dataset                         Create a new dataset with the ID "my_dataset".
  node datasets delete my_dataset                         Delete a dataset identified as "my_dataset".
  node datasets list                                      List datasets.
  node datasets list -p bigquery-public-data              List datasets in the "bigquery-public-data" project.
  node datasets size my_dataset                           Calculate the size of "my_dataset".
  node datasets size hacker_news -p bigquery-public-data  Calculate the size of "bigquery-public-data:hacker_news".

For more information, see https://cloud.google.com/bigquery/docs
```

[datasets_docs]: https://cloud.google.com/bigquery/docs
[datasets_code]: datasets.js

### Queries

View the [documentation][queries_docs] or the [source code][queries_code].

__Usage:__ `node queries --help`

```
Commands:
  sync <sqlQuery>   Run the specified synchronous query.
  async <sqlQuery>  Start the specified asynchronous query.
  wait <jobId>      Wait for the specified job to complete and retrieve its results.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node queries sync "SELECT * FROM
  `publicdata.samples.natality` LIMIT 5;"
  node queries async "SELECT * FROM
  `publicdata.samples.natality` LIMIT 5;"
  node queries wait job_VwckYXnR8yz54GBDMykIGnrc2

For more information, see https://cloud.google.com/bigquery/docs
```

[queries_docs]: https://cloud.google.com/bigquery/docs
[queries_code]: queries.js

### Tables

View the [documentation][tables_docs] or the [source code][tables_code].

__Usage:__ `node tables --help`

```
Commands:
  create <datasetId> <tableId>                                  Create a new table with the specified ID in the
                                                                specified dataset.
  list <datasetId>                                              List tables in the specified dataset.
  delete <datasetId> <tableId>                                  Delete the specified table from the specified dataset.
  copy <srcDatasetId> <srcTableId> <destDatasetId>              Make a copy of an existing table.
  <destTableId>
  browse <datasetId> <tableId>                                  List the rows from the specified table.
  import <datasetId> <tableId> <fileName>                       Import data from a local file or a Google Cloud Storage
                                                                file into the specified table.
  export <datasetId> <tableId> <bucketName> <fileName>          Export a table from BigQuery to Google Cloud Storage.
  insert <datasetId> <tableId> <json_or_file>                   Insert a JSON array (as a string or newline-delimited
                                                                file) into a BigQuery table.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node tables create my_dataset my_table                        Create table "my_table" in "my_dataset".
  node tables list my_dataset                                   List tables in "my_dataset".
  node tables browse my_dataset my_table                        Display rows from "my_table" in "my_dataset".
  node tables delete my_dataset my_table                        Delete "my_table" from "my_dataset".
  node tables import my_dataset my_table ./data.csv             Import a local file into a table.
  node tables import my_dataset my_table data.csv --bucket      Import a GCS file into a table.
  my-bucket
  node tables export my_dataset my_table my-bucket my-file      Export my_dataset:my_table to gcs://my-bucket/my-file as
                                                                raw CSV.
  node tables export my_dataset my_table my-bucket my-file -f   Export my_dataset:my_table to gcs://my-bucket/my-file as
  JSON --gzip                                                   gzipped JSON.
  node tables insert my_dataset my_table json_string            Insert the JSON array represented by json_string into
                                                                my_dataset:my_table.
  node tables insert my_dataset my_table json_file              Insert the JSON objects contained in json_file (one per
                                                                line) into my_dataset:my_table.
  node tables copy src_dataset src_table dest_dataset           Copy src_dataset:src_table to dest_dataset:dest_table.
  dest_table

For more information, see https://cloud.google.com/bigquery/docs
```

[tables_docs]: https://cloud.google.com/bigquery/docs
[tables_code]: tables.js
