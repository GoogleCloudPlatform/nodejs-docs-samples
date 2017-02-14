<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Spanner Node.js Samples

[Cloud Spanner][spanner_docs] is a managed, mission-critical, globally
consistent and scalable relational database service. Cloud Spanner solves the
need for a horizontally-scaling database with consistent global transaction and
SQL semantics.

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Getting started with Google Cloud Spanner API](#getting-started-with-google-cloud-spanner-api)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Getting started with Google Cloud Spanner API

View the [Spanner documentation][spanner_docs] or the [samples][spanner_samples].

__Run the samples:__

```sh
node schema.js --help
```

```
Commands:
  createDatabase <instanceName> <databaseName>  Creates an example database with two tables in a Cloud Spanner instance.
  addColumn <instanceName> <databaseName>       Adds an example MarketingBudget column to an example Cloud Spanner
                                                table.
  queryNewColumn <instanceName> <databaseName>  Executes a read-only SQL query against an example Cloud Spanner table
                                                with an additional column (MarketingBudget) added by addColumn.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node schema.js createDatabase "my-instance" "my-database"
  node schema.js addColumn "my-instance" "my-database"
  node schema.js queryNewColumn "my-instance" "my-database"

For more information, see https://cloud.google.com/spanner/docs
```

```sh
node crud.js --help
```

```
Commands:
  update <instanceName> <databaseName>  Modifies existing rows of data in an example Cloud Spanner table.
  query <instanceName> <databaseName>   Executes a read-only SQL query against an example Cloud Spanner table.
  insert <instanceName> <databaseName>  Inserts new rows of data into an example Cloud Spanner table.
  read <instanceName> <databaseName>    Reads data in an example Cloud Spanner table.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node crud.js update "my-instance" "my-database"
  node crud.js query "my-instance" "my-database"
  node crud.js insert "my-instance" "my-database"
  node crud.js read "my-instance" "my-database"

For more information, see https://cloud.google.com/spanner/docs
```

```sh
node indexing.js --help
```

```
Commands:
  createIndex <instanceName> <databaseName>         Creates a new index in an example Cloud Spanner table.
  createStoringIndex <instanceName> <databaseName>  Creates a new value-storing index in an example Cloud Spanner table.
  queryIndex <instanceName> <databaseName>          Executes a read-only SQL query against an example Cloud Spanner
                                                    table using an existing index.
  readIndex <instanceName> <databaseName>           Reads data from an example Cloud Spanner table using an existing
                                                    index.
  readStoringIndex <instanceName> <databaseName>    Reads data from an example Cloud Spanner table using an existing
                                                    storing index.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node indexing.js createIndex "my-instance" "my-database"
  node indexing.js createStoringIndex "my-instance" "my-database"
  node indexing.js queryIndex "my-instance" "my-database"
  node indexing.js readIndex "my-instance" "my-database"
  node indexing.js readStoringIndex "my-instance" "my-database"

For more information, see https://cloud.google.com/spanner/docs
```

```sh
node transaction.js --help
```

```
Commands:
  readOnly <instanceName> <databaseName>   Execute a read-only transaction on an example Cloud Spanner table.
  readWrite <instanceName> <databaseName>  Execute a read-write transaction on an example Cloud Spanner table.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node transaction.js readOnly "my-instance" "my-database"
  node transaction.js readWrite "my-instance" "my-database"

For more information, see https://cloud.google.com/spanner/docs
```

For more information, see [the docs][spanner_docs].

[spanner_samples]: ../
[spanner_docs]: https://cloud.google.com/spanner/docs/