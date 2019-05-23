// Deletes an existing Note from the server
async function main(
  projectId = 'your-project-id', // Your GCP Project Id
  noteId = 'my-note-id' // Id of the note
) {
  // [START containeranalysis_delete_note]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project Id
  // const noteId = 'my-note-id' // Id of the note

  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Get the full path to the note
  const formattedName = client.notePath(projectId, noteId);

  // Delete the note
  await client.deleteNote({name: formattedName});
  console.log(`Note ${formattedName} deleted.`);
  // [END containeranalysis_delete_note]
}

main(...process.argv.slice(2));
