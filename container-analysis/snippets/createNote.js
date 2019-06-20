// sample-metadata:
//   title: Create Note
//   description: Creates a Note with specified ID
//   usage: node createNote.js "project-id" "note-id"
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
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  // Construct request
  // Associate the Note with a metadata type
  // https://cloud.google.com/container-registry/docs/container-analysis#supported_metadata_types
  // Here, we use the type "vulnerabiltity"
  const formattedParent = client.getGrafeasClient().projectPath(projectId);

  // Creates and returns a new Note
  const [note] = await client.getGrafeasClient().createNote({
    parent: formattedParent,
    noteId: noteId,
    note: {
      vulnerability: {
        details: [
          {
            affectedCpeUri: 'foo.uri',
            affectedPackage: 'foo',
            minAffectedVersion: {
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

  console.log(`Note ${note.name} created.`);
  // [END containeranalysis_create_note]
}

main(...process.argv.slice(2));
