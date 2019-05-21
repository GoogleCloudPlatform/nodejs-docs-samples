async function main(
  noteProjectId = 'your-project-id', // Your GCP Project Id
  noteId = 'my-note-id', // Id of the note
  occurenceProjectId = 'your-project-id', // GCP Project Id of Occurence
  imageUrl = 'https://gcr.io/my-project/my-image:123' // Image to attach metadata to
) {
  // [START containeranalysis_create_occurrence]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const noteProjectId = 'your-project-id', // Your GCP Project Id
  // const noteId = 'my-note-id', // Id of the note
  // const occurenceProjectId = 'your-project-id', // GCP Project Id of Occurence
  // const imageUrl = 'https://gcr.io/my-project/my-image:123' // Image to attach metadata to

  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Construct request
  const formattedParent = client.projectPath(occurenceProjectId);
  const formattedNote = client.notePath(noteProjectId, noteId);

  // Creates and returns a new Occurrence associated with an existing Note
  const [occurrence] = await client.createOccurrence({
    parent: formattedParent,
    occurrence: {
      noteName: formattedNote,
      vulnerability: {},
      resource: {
        uri: imageUrl,
      },
    },
  });
  console.log(`Occurrence created ${occurrence.name}.`);
  return occurrence;
}
// [END containeranalysis_create_occurrence]

main(...process.argv.slice(2));
