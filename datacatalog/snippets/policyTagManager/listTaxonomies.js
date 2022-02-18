// Copyright 2022 Google LLC
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

function main(projectId, location) {
  // [START data_catalog_ptm_list_taxonomies]
  // Import the Google Cloud client library.
  const {DataCatalogClient, PolicyTagManagerClient} =
    require('@google-cloud/datacatalog').v1;
  const dataCatalog = new DataCatalogClient();
  const policyTagManager = new PolicyTagManagerClient();

  async function listTaxonomies() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my_project'; // Google Cloud Platform project
    // const location = 'us';

    // Parent project location format is `projects/${projectId}/locations/${location}`
    const parent = dataCatalog.locationPath(projectId, location);

    const request = {
      parent: parent,
    };

    try {
      const [taxonomies] = await policyTagManager.listTaxonomies(request);
      console.log('Taxonomies:');
      taxonomies.forEach(taxonomy => {
        console.log(taxonomy.name);
      });
    } catch (e) {
      console.error(e);
      process.exitCode = 1;
    }
  }
  // [END data_catalog_ptm_list_taxonomies]
  listTaxonomies();
}
main(...process.argv.slice(2));
