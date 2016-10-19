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
  create <datasetId>            Creates a new dataset.
  delete <datasetId>            Deletes a dataset.
  list [projectId]              Lists all datasets in the specified project or the current project.
  size <datasetId> [projectId]  Calculates the size of a dataset.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node datasets create my_dataset                      Creates a new dataset named "my_dataset".
  node datasets delete my_dataset                      Deletes a dataset named "my_dataset".
  node datasets list                                   Lists all datasets in the current project.
  node datasets list bigquery-public-data              Lists all datasets in the "bigquery-public-data" project.
  node datasets size my_dataset                        Calculates the size of "my_dataset" in the current project.
  node datasets size hacker_news bigquery-public-data  Calculates the size of "bigquery-public-data:hacker_news".

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
  shakespeare       Queries a public Shakespeare dataset.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node queries sync "SELECT * FROM publicdata.samples.natality  Synchronously queries the natality dataset.
  LIMIT 5;"
  node queries async "SELECT * FROM                             Queries the natality dataset as a job.
  publicdata.samples.natality LIMIT 5;"
  node queries shakespeare                                      Queries a public Shakespeare dataset.

For more information, see https://cloud.google.com/bigquery/docs
```

[queries_docs]: https://cloud.google.com/bigquery/docs
[queries_code]: queries.js

### Tables

View the [documentation][tables_docs] or the [source code][tables_code].

__Usage:__ `node tables --help`

```
Commands:
  create <datasetId> <tableId> <schema> [projectId]             Creates a new table.
  list <datasetId> [projectId]                                  Lists all tables in a dataset.
  delete <datasetId> <tableId> [projectId]                      Deletes a table.
  copy <srcDatasetId> <srcTableId> <destDatasetId>              Makes a copy of a table.
  <destTableId> [projectId]
  browse <datasetId> <tableId> [projectId]                      Lists rows in a table.
  import <datasetId> <tableId> <fileName> [projectId]           Imports data from a local file into a table.
  import-gcs <datasetId> <tableId> <bucketName> <fileName>      Imports data from a Google Cloud Storage file into a
  [projectId]                                                   table.
  export <datasetId> <tableId> <bucketName> <fileName>          Export a table from BigQuery to Google Cloud Storage.
  [projectId]
  insert <datasetId> <tableId> <json_or_file> [projectId]       Insert a JSON array (as a string or newline-delimited
                                                                file) into a BigQuery table.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node tables create my_dataset my_table "Name:string,          Createss a new table named "my_table" in "my_dataset".
  Age:integer, Weight:float, IsMagic:boolean"
  node tables list my_dataset                                   Lists tables in "my_dataset".
  node tables browse my_dataset my_table                        Displays rows from "my_table" in "my_dataset".
  node tables delete my_dataset my_table                        Deletes "my_table" from "my_dataset".
  node tables import my_dataset my_table ./data.csv             Imports a local file into a table.
  node tables import-gcs my_dataset my_table my-bucket          Imports a GCS file into a table.
  data.csv
  node tables export my_dataset my_table my-bucket my-file      Exports my_dataset:my_table to gcs://my-bucket/my-file
                                                                as raw CSV.
  node tables export my_dataset my_table my-bucket my-file -f   Exports my_dataset:my_table to gcs://my-bucket/my-file
  JSON --gzip                                                   as gzipped JSON.
  node tables insert my_dataset my_table json_string            Inserts the JSON array represented by json_string into
                                                                my_dataset:my_table.
  node tables insert my_dataset my_table json_file              Inserts the JSON objects contained in json_file (one per
                                                                line) into my_dataset:my_table.
  node tables copy src_dataset src_table dest_dataset           Copies src_dataset:src_table to dest_dataset:dest_table.
  dest_table

For more information, see https://cloud.google.com/bigquery/docs
```

[tables_docs]: https://cloud.google.com/bigquery/docs
[tables_code]: tables.js
