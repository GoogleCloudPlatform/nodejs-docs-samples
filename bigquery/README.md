<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# BigQuery Node.js Samples

[BigQuery][bigquery_docs] is Google&#x27;s fully managed, petabyte scale, low cost
analytics data warehouse.

[bigquery_docs]: https://cloud.google.com/bigquery/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Datasets](#datasets)
  * [Tables](#tables)
  * [Queries](#queries)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Datasets

View the [documentation][datasets_0_docs] or the [source code][datasets_0_code].

__Usage:__ `node datasets --help`

```
Commands:
  create <name>       Create a new dataset.
  delete <datasetId>  Delete the specified dataset.
  list                List datasets in the authenticated project.
  size <datasetId>    Calculate the size of the specified dataset.

Options:
  --projectId, -p  Optionally specify the project ID to use.
                                                           [string] [default: "nodejs-docs-samples"]
  --help           Show help                                                               [boolean]

Examples:
  node datasets create my_dataset                     Create a new dataset named "my_dataset".
  node datasets delete my_dataset                     Delete "my_dataset".
  node datasets list                                  List datasets.
  node datasets list -p bigquery-public-data          List datasets in a project other than the
                                                      authenticated project.
  node datasets size my_dataset                       Calculate the size of "my_dataset".
  node datasets size hacker_news -p                   Calculate the size of
  bigquery-public-data                                "bigquery-public-data:hacker_news".

For more information, see https://cloud.google.com/bigquery/docs
```

[datasets_0_docs]: https://cloud.google.com/bigquery/docs
[datasets_0_code]: datasets.js

### Tables

View the [documentation][tables_1_docs] or the [source code][tables_1_code].

__Usage:__ `node tables --help`

```
Commands:
  create <dataset> <table>                  Create a new table in the specified dataset.
  list <dataset>                            List tables in the specified dataset.
  delete <dataset> <table>                  Delete a table in the specified dataset.
  import <dataset> <table> <file>           Import data from a local file or a Google Cloud Storage
                                            file into BigQuery.
  export <dataset> <table> <bucket> <file>  Export a table from BigQuery to Google Cloud Storage.

Options:
  --help  Show help                                                                        [boolean]

Examples:
  node tables create my_dataset my_table              Create table "my_table" in "my_dataset".
  node tables list my_dataset                         List tables in "my_dataset".
  node tables delete my_dataset my_table              Delete "my_table" from "my_dataset".
  node tables import my_dataset my_table ./data.csv   Import a local file into a table.
  node tables import my_dataset my_table data.csv     Import a GCS file into a table.
  --bucket my-bucket
  node tables export my_dataset my_table my-bucket    Export my_dataset:my_table to
  my-file                                             gcs://my-bucket/my-file as raw CSV
  node tables export my_dataset my_table my-bucket    Export my_dataset:my_table to
  my-file -f JSON --gzip                              gcs://my-bucket/my-file as gzipped JSON

For more information, see https://cloud.google.com/bigquery/docs
```

[tables_1_docs]: https://cloud.google.com/bigquery/docs
[tables_1_code]: tables.js

### Queries

View the [documentation][queries_2_docs] or the [source code][queries_2_code].

__Usage:__ `node queries --help`

```
Commands:
  sync <query>   Run a synchronous query.
  async <query>  Start an asynchronous query.
  poll <jobId>   Get the status of a job.

Options:
  --help  Show help                                                    [boolean]

Examples:
  node queries sync "SELECT * FROM
  publicdata:samples.natality LIMIT 5;"
  node queries async "SELECT * FROM
  publicdata:samples.natality LIMIT 5;"
  node queries poll 12345

For more information, see https://cloud.google.com/bigquery/docs
```

[queries_2_docs]: https://cloud.google.com/bigquery/docs
[queries_2_code]: queries.js
