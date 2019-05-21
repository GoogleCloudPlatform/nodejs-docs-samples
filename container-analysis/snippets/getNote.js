async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  noteId = 'my-note-id' // Id of the note
) {
  // [START containeranalysis_get_note]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const noteId = 'my-note-id' // Id of the note

  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Get the full path to the note
  const formattedName = client.notePath(projectId, noteId);
  // Retrieve the specified note
  const [note] = await client.getNote({name: formattedName});

  console.log(`Note name: ${note.name}`);
}
// [END containeranalysis_get_note]

main(...process.argv.slice(2));
