<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Spanner Node.js Samples

[![Build](https://storage.googleapis.com/cloud-docs-samples-badges/GoogleCloudPlatform/nodejs-docs-samples/nodejs-docs-samples-spanner.svg)]()

[Cloud Spanner](https://cloud.google.com/spanner/docs/) is a fully managed, mission-critical, relational database service that offers transactional consistency at global scale, schemas, SQL (ANSI 2011 with extensions), and automatic, synchronous replication for high availability.

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Schema](#schema)
  * [CRUD](#crud)
  * [Indexing](#indexing)
  * [Transactions](#transactions)
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

### Schema

View the [documentation][schema_0_docs] or the [source code][schema_0_code].

__Usage:__ `node schema.js --help`

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

[schema_0_docs]: https://cloud.google.com/spanner/docs
[schema_0_code]: schema.js

### CRUD

View the [documentation][crud_1_docs] or the [source code][crud_1_code].

__Usage:__ `node crud.js --help`

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

[crud_1_docs]: https://cloud.google.com/spanner/docs
[crud_1_code]: crud.js

### Indexing

View the [documentation][indexing_2_docs] or the [source code][indexing_2_code].

__Usage:__ `node indexing.js --help`

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

[indexing_2_docs]: https://cloud.google.com/spanner/docs
[indexing_2_code]: indexing.js

### Transactions

View the [documentation][transaction_3_docs] or the [source code][transaction_3_code].

__Usage:__ `node transaction.js --help`

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

[transaction_3_docs]: https://cloud.google.com/spanner/docs
[transaction_3_code]: transaction.js

## Running the tests

1.  Set the **GCLOUD_PROJECT** and **GOOGLE_APPLICATION_CREDENTIALS** environment variables.

1.  Run the tests:

    With **npm**:

        npm test

    With **yarn**:

        yarn test
