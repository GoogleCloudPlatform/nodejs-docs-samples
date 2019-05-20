// [START containeranalysis_get_note]
// Retrieves and prints a specified Note from the server
const getNote = async (
  projectId = 'your-project-id', // Your GCP Project ID
  noteId = 'my-note-id' // Id of the note
) => {
  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Get the full path to the note
  const formattedName = client.notePath(projectId, noteId);
  // Get the note
  const [note] = await client.getNote({name: formattedName});

  console.log(`Note name: ${note.name}`);
};
// [END containeranalysis_get_note]

const args = process.argv.slice(2);
getNote(...args).catch(console.error);
