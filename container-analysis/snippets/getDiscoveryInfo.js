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
//   title: Get Discovery Info
//   description: Gets all Discovery Occurrences attached to specified image
//   usage: node getDiscoveryInfo.js "project-id" "image-url"
async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  // If you are using Google Container Registry
  imageUrl = 'https://gcr.io/my-project/my-repo/my-image:123' // Image to attach metadata to
  // If you are using Google Artifact Registry
  // imageUrl = 'https://LOCATION-docker.pkg.dev/my-project/my-repo/my-image:123' // Image to attach metadata to
) {
  // [START containeranalysis_discovery_info]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // If you are using Google Container Registry
  // const imageUrl = 'https://gcr.io/my-project/my-repo/my-image:123' // Image to attach metadata to
  // If you are using Google Artifact Registry
  // const imageUrl = 'https://LOCATION-docker.pkg.dev/my-project/my-repo/my-image:123' // Image to attach metadata to

  // Import the library and create a client
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  const formattedParent = client.getGrafeasClient().projectPath(projectId);
  // Retrieves and prints the Discovery Occurrence created for a specified image
  // The Discovery Occurrence contains information about the initial scan on the image
  const [occurrences] = await client.getGrafeasClient().listOccurrences({
    parent: formattedParent,
    filter: `kind = "DISCOVERY" AND resourceUrl = "${imageUrl}"`,
  });

  if (occurrences.length > 0) {
    console.log(`Discovery Occurrences for ${imageUrl}`);
    occurrences.forEach(occurrence => {
      console.log(`${occurrence.name}:`);
    });
  } else {
    console.log('No occurrences found.');
  }
  // [END containeranalysis_discovery_info]
}

main(...process.argv.slice(2));
