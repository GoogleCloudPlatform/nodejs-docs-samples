# Google Developer Knowledge API Node.js Samples

This directory contains Node.js code samples demonstrating how to use the [Google Developer Knowledge API](https://developers.google.com/knowledge) client library (`@google/developer-knowledge`).

## Setup

1. Enable the Developer Knowledge API on your Google Cloud project:

   ```bash
   gcloud services enable developerknowledge.googleapis.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Samples

- **[Answer Query](answerQuery.js)**: Get a grounded, cited answer to a technical question (`developerknowledge_answer_query`).
- **[Get Document](getDocument.js)**: Retrieve a single documentation page with full markdown content (`developerknowledge_get_document`).
- **[Batch Get Documents](batchGetDocuments.js)**: Fetch multiple documentation pages in one call (`developerknowledge_batch_get_documents`).
- **[Search Document Chunks](searchDocumentChunks.js)**: Search public developer documentation chunks by query (`developerknowledge_search_document_chunks`).

## Running Tests

```bash
npm test
```
