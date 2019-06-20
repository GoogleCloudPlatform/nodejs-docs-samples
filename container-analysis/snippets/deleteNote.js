// sample-metadata:
//   title: Delete Note
//   description: Deletes a specified Note
//   usage: node deleteNote.js "project-id" "note-id"
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
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  // Get the full path to the note
  const formattedName = client.notePath(projectId, noteId);

  // Delete the note
  await client.getGrafeasClient().deleteNote({name: formattedName});
  console.log(`Note ${formattedName} deleted.`);
  // [END containeranalysis_delete_note]
}

main(...process.argv.slice(2));
