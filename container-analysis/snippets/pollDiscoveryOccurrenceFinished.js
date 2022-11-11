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
//   title: Poll Discovery Occurrence Finished
//   description: Waits for a Discovery Occurrence to reach a terminal state
//   usage: node pollDiscoveryOccurrenceFinished.js "project-id" "image-url" "retries"
async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  imageUrl = 'https://gcr.io/my-project/my-image:123', // Image to attach metadata to
  // If you are using Google Artifact Registry
  // imageUrl = 'https://LOCATION-docker.pkg.dev/my-project/my-repo/my-image:123', // Image to attach metadata to
  retries = 5 // The number of retries to listen for the new Pub/Sub messages
) {
  // [START containeranalysis_poll_discovery_occurrence_finished]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // If you are using Google Container Registry
  // const imageUrl = 'https://gcr.io/my-project/my-repo/my-image:123' // Image to attach metadata to
  // If you are using Google Artifact Registry
  // const imageUrl = 'https://LOCATION-docker.pkg.dev/my-project/my-repo/my-image:123' // Image to attach metadata to
  // const retries = 5 // The number of retries to listen for the new Pub/Sub messages

  // Import the library and create a client
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  const formattedParent = client.getGrafeasClient().projectPath(projectId);

  let filter = `resourceUrl="${imageUrl}" AND noteProjectId="goog-analysis" AND noteId="PACKAGE_VULNERABILITY"`;
  // [END containeranalysis_poll_discovery_occurrence_finished]
  // The above filter isn't testable, since it looks for occurrences in a locked down project
  // Fall back to a more permissive filter for testing
  filter = `kind = "DISCOVERY" AND resourceUrl = "${imageUrl}"`;
  // [START containeranalysis_poll_discovery_occurrence_finished]

  // Repeatedly query the Container Analysis API for the latest discovery occurrence until it is
  // either in a terminal state, or the timeout value has been exceeded
  const pRetry = require('p-retry');
  const discoveryOccurrence = await pRetry(
    async () => {
      const [occurrences] = await client.getGrafeasClient().listOccurrences({
        parent: formattedParent,
        filter: filter,
      });
      if (occurrences.length < 0) {
        throw new Error('No occurrences found for ' + imageUrl);
      }
      return occurrences[0];
    },
    {
      retries: retries,
    }
  );

  // Wait for discovery occurrence to enter a terminal state or the timeout value has been exceeded
  const finishedOccurrence = await pRetry(
    async () => {
      let status = 'PENDING';
      const [updated] = await client.getGrafeasClient().getOccurrence({
        name: discoveryOccurrence.name,
      });
      status = updated.discovery.analysisStatus;
      if (
        status !== 'FINISHED_SUCCESS' &&
        status !== 'FINISHED_FAILED' &&
        status !== 'FINISHED_UNSUPPORTED'
      ) {
        throw new Error('Timeout while retrieving discovery occurrence');
      }
      return updated;
    },
    {
      retries: retries,
    }
  );
  console.log(
    `Found discovery occurrence ${finishedOccurrence.name}.  Status: ${finishedOccurrence.discovery.analysisStatus}`
  );
  // [END containeranalysis_poll_discovery_occurrence_finished]
}

main(...process.argv.slice(2));
