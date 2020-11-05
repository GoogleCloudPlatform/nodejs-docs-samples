// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * This application demonstrates how to perform lookup operations with the
 * Cloud Data Catalog API.

 * For more information, see the README.md under /datacatalog and the
 * documentation at https://cloud.google.com/data-catalog/docs.
 */
const main = async (projectId, datasetId) => {
  // [START datacatalog_lookup_dataset]
  // -------------------------------
  // Import required modules.
  // -------------------------------
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  const lookup = async () => {
    // TODO(developer): Uncomment the following lines before running the sample.
    // const projectId = 'my-project'
    // const datasetId = 'my_dataset'
    const resourceName = `//bigquery.googleapis.com/projects/${projectId}/datasets/${datasetId}`;
    const request = {linkedResource: resourceName};
    const [result] = await datacatalog.lookupEntry(request);
    return result;
  };

  const response = await lookup();
  console.log(response);
  // [END datacatalog_lookup_dataset]
};

// node lookupEntry.js <projectId> <datasetID>
main(...process.argv.slice(2));
