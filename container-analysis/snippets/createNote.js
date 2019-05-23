async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  noteId = 'my-note-id' // Id of the note
) {
  // [START containeranalysis_create_note]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const noteId = 'my-note-id' // Id of the note

  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Construct request
  // Associate the Note with a metadata type
  // https://cloud.google.com/container-registry/docs/container-analysis#supported_metadata_types
  // Here, we use the type "vulnerabiltity"
  const formattedParent = client.projectPath(projectId);

  // Creates and returns a new Note
  const [note] = await client.createNote({
    parent: formattedParent,
    noteId: noteId,
    note: {
      vulnerability: {},
    },
  });

  console.log(`Note ${note.name} created.`);
  // [END containeranalysis_create_note]
}

main(...process.argv.slice(2));
