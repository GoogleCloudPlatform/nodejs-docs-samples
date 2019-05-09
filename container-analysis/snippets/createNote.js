// [START containeranalysis_create_note]
// Creates and returns a new Note
async function createNote(
    projectId = 'your-project-id', // Your GCP Project ID
    noteId = 'my-note-id', // Id of the note
) {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();

    // Construct request
    // Associate the Note with a metadata type
    // https://cloud.google.com/container-registry/docs/container-analysis#supported_metadata_types
    // Here, we use the type "attestation"
    const formattedParent = client.projectPath(projectId);

    const [note] = await client.createNote({
        parent: formattedParent,
        noteId: noteId,
        note: {
            vulnerability: {}
        }
    });

    console.log(`Note ${note.name} created.`);

};
// [END containeranalysis_create_note]


const args = process.argv.slice(2);
createNote(...args).catch(console.error);