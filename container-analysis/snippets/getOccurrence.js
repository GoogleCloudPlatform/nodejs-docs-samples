// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// sample-metadata:
//   title: Get Occurrence
//   description: Retrieves and prints a specified Occurrence
//   usage: node getOccurrence.js "project-id" "occurrence-id"
async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  occurrenceId = 'my-occurrence' // The API-generated identifier associated with the occurrence
) {
  // [START containeranalysis_get_occurrence]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const occurrenceId = 'my-occurrence' // The API-generated identifier associated with the occurrence

  // Import the library and create a client
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  // Get full path to occurrence
  const formattedName = client
    .getGrafeasClient()
    .occurrencePath(projectId, occurrenceId);

  // Retrieves the specified occurrence
  const [occurrence] = await client.getGrafeasClient().getOccurrence({
    name: formattedName,
  });

  console.log(`Occurrence name: ${occurrence.name}`);
  // [END containeranalysis_get_occurrence]
}

main(...process.argv.slice(2));
