// Copyright 2020 Google LLC
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

async function main(projectId) {
  // [START data_catalog_search_assets]
  // Import the Google Cloud client library.
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  async function searchAssets() {
    // Search data assets.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my_project'; // Google Cloud Platform project

    // Set custom query.
    const query = 'type=lake';

    // Create request.
    const scope = {
      includeProjectIds: [projectId],
      // Alternatively, search using Google Cloud Organization scopes.
      // includeOrgIds: [organizationId],
    };

    const request = {
      scope: scope,
      query: query,
    };

    const [result] = await datacatalog.searchCatalog(request);

    console.log(`Found ${result.length} datasets in project ${projectId}.`);
    console.log('Datasets:');
    result.forEach(dataset => {
      console.log(dataset.relativeResourceName);
    });
  }
  searchAssets();
  // [END data_catalog_search_assets]
}
main(...process.argv.slice(2));
