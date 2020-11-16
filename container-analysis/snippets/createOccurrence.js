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
//   title: Create Occurrence
//   description: Creates an Occurrence of a Note and attaches it as a metadata to an image
//   usage: node createOccurrence.js "note-project-id" "note-id" "occurrence-project-id" "image url"
async function main(
  noteProjectId = 'your-project-id', // Your GCP Project Id
  noteId = 'my-note-id', // Id of the note
  occurrenceProjectId = 'your-project-id', // GCP Project Id of Occurrence
  // If you are using Google Container Registry
  imageUrl = 'https://gcr.io/my-project/my-repo/my-image:123' // Image to attach metadata to
  // If you are using Google Artifact Registry
  // imageUrl = 'https://LOCATION-docker.pkg.dev/my-project/my-repo/my-image:123' // Image to attach metadata to
) {
  // [START containeranalysis_create_occurrence]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const noteProjectId = 'your-project-id', // Your GCP Project Id
  // const noteId = 'my-note-id', // Id of the note
  // const occurrenceProjectId = 'your-project-id', // GCP Project Id of Occurrence
  // If you are using Google Container Registry
  // const imageUrl = 'https://gcr.io/my-project/my-repo/my-image:123' // Image to attach metadata to
  // If you are using Google Artifact Registry
  // const imageUrl = 'https://LOCATION-docker.pkg.dev/my-project/my-repo/my-image:123' // Image to attach metadata to

  // Import the library and create a client
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  // Construct request
  const formattedParent = client
    .getGrafeasClient()
    .projectPath(occurrenceProjectId);
  const formattedNote = client
    .getGrafeasClient()
    .notePath(noteProjectId, noteId);

  // Creates and returns a new Occurrence associated with an existing Note
  const [occurrence] = await client.getGrafeasClient().createOccurrence({
    parent: formattedParent,
    occurrence: {
      noteName: formattedNote,
      resourceUri: imageUrl,
      vulnerability: {
        packageIssue: [
          {
            affectedCpeUri: 'foo.uri',
            affectedPackage: 'foo',
            affectedVersion: {
              kind: 'MINIMUM',
            },
            fixedVersion: {
              kind: 'MAXIMUM',
            },
          },
        ],
      },
    },
  });
  console.log(`Occurrence created ${occurrence.name}.`);
  return occurrence;
  // [END containeranalysis_create_occurrence]
}

main(...process.argv.slice(2));
