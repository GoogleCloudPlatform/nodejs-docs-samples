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
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Get path to Note
  const formattedNote = client.notePath(projectId, noteId);

  // Retrieves all the Occurrences associated with a specified Note
  const [occurrences] = await client.listNoteOccurrences({
    name: formattedNote,
  });
  if (occurrences.length) {
    console.log('Occurrences:');
    occurrences.forEach(occurrence => {
      console.log(`${occurrence.name}:`);
      console.log(
        `  Created: ${new Date(occurrence.createTime.seconds * 1000)}`
      );
    });
  } else {
    console.log('No occurrences found.');
  }
  // [END containeranalysis_occurrences_for_note]
}

main(...process.argv.slice(2));
