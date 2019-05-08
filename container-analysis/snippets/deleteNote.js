// [START containeranalysis_delete_note]
// Deletes an existing Note from the server
const deleteNote = async(
    projectId = 'your-project-id', // Your GCP Project Id
    noteId = 'my-note-id', // Id of the note
) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();

    // Get the full path to the note
    const formattedName = client.notePath(projectId, noteId);

    // Delete the note
    const response  = await client.deleteNote({name: formattedName});
    console.log(`Note ${formattedName} deleted.`);
};
// [END containeranalysis_delete_note]

const args = process.argv.slice(2);
deleteNote(...args).catch(console.error);