# Migrating BigQuery Storage API from v1beta1 to v1: JavaScript

This guide shows how to migrate JavaScript code using the BigQuery Storage API
from version `v1beta1` to `v1`.

## Key Changes

*   **Service Client**: `BigQueryStorageClient` (in `v1beta1` namespace) is
    replaced by `BigQueryReadClient` (in `v1` namespace).
*   **Table Reference**: `tableReference` object is replaced by a simple string
    representation of the table path in `readSession.table`.
*   **Session Configuration**: Configuration fields (table, format, read
    options) have moved into `readSession` object, which is passed in
    `createReadSession` request.
*   **Parallelism**: `requestedStreams` is replaced by `maxStreamCount`.
*   **Sharding Strategy**: `shardingStrategy` is removed. The server now
    automatically balances the streams.
*   **Read Rows Request**: `readPosition` is flattened. You now pass the stream
    name directly as `readStream` and the `offset` as a top-level field in the
    `readRows` request.

## Code Comparison

### 1. Client Initialization

**v1beta1:**

```javascript
const {v1beta1} = require('@google-cloud/bigquery-storage');
const client = new v1beta1.BigQueryStorageClient();
```

**v1:**

```javascript
const {v1} = require('@google-cloud/bigquery-storage');
const client = new v1.BigQueryReadClient();
```

### 2. Creating a Read Session

**v1beta1:**

```javascript
const {v1beta1} = require('@google-cloud/bigquery-storage');

const tableReference = {
  projectId: 'bigquery-public-data',
  datasetId: 'usa_names',
  tableId: 'usa_1910_current',
};

const readOptions = {
  selectedFields: ['name'],
  rowRestriction: 'state = "WA"',
};

const request = {
  parent: 'projects/read-session-project',
  tableReference: tableReference,
  readOptions: readOptions,
  requestedStreams: 1,
  format: v1beta1.protos.google.cloud.bigquery.storage.v1beta1.DataFormat.AVRO,
  shardingStrategy: v1beta1.protos.google.cloud.bigquery.storage.v1beta1.ShardingStrategy.LIQUID,
};

const [session] = await client.createReadSession(request);
```

**v1:**

```javascript
const {v1} = require('@google-cloud/bigquery-storage');

// Table path is now a string: projects/{project}/datasets/{dataset}/tables/{table}
const tablePath = 'projects/bigquery-public-data/datasets/usa_names/tables/usa_1910_current';

const readOptions = {
  selectedFields: ['name'],
  rowRestriction: 'state = "WA"',
};

// ReadSession holds the session configuration
const readSession = {
  table: tablePath,
  dataFormat: v1.protos.google.cloud.bigquery.storage.v1.DataFormat.AVRO, // format renamed to dataFormat
  readOptions: readOptions,
};

const request = {
  parent: 'projects/read-session-project',
  readSession: readSession,
  maxStreamCount: 1, // requestedStreams renamed to maxStreamCount
};

const [session] = await client.createReadSession(request);
```

### 3. Reading Rows

**v1beta1:**

```javascript
const stream = session.streams[0];

const request = {
  readPosition: {
    stream: stream, // Stream object
    offset: 0,
  },
};

const rowStream = client.readRows(request);

rowStream
  .on('data', (response) => {
    // Process response.avroRows
  })
  .on('error', (err) => {
    // Handle error
  })
  .on('end', () => {
    // Done
  });
```

**v1:**

```javascript
const stream = session.streams?.[0];
if (!stream) {
  throw new Error('No streams available');
}

// Request is flattened. Pass readStream (string) and offset directly.
const request = {
  readStream: stream.name, // Stream name string
  offset: 0,
};

const rowStream = client.readRows(request);

rowStream
  .on('data', (response) => {
    // Process response.avroRows
    // Note: Prefer using response.rowCount over response.avroRows?.rowCount (deprecated)
  })
  .on('error', (err) => {
    // Handle error
  })
  .on('end', () => {
    // Done
  });
```
