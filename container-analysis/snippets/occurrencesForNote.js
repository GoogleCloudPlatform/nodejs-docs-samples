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
//   title: Occurrences for Note
//   description: Retrieves all Occurrences of a specified Note
//   usage: node occurrencesForNote.js "project-id" "note-id"
async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  noteId = 'my-note-id' // Id of the note
) {
  // [START containeranalysis_occurrences_for_note]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const noteId = 'my-note-id' // Id of the note

  // Import the library and create a client
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  // Get path to Note
  const formattedNote = client.notePath(projectId, noteId);

  // Retrieves all the Occurrences associated with a specified Note
  const [occurrences] = await client.getGrafeasClient().listNoteOccurrences({
    name: formattedNote,
  });

  if (occurrences.length) {
    console.log('Occurrences:');
    occurrences.forEach(occurrence => {
      console.log(`${occurrence.name}:`);
    });
  } else {
    console.log('No occurrences found.');
  }
  // [END containeranalysis_occurrences_for_note]
}

main(...process.argv.slice(2));
