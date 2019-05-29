// sample-metadata:
//   title: Create Occurrence
//   description: Creates an Occurrence of a Note and attaches it as a metadata to an image
//   usage: node createOccurrence.js "note-project-id" "note-id" "occurrence-project-id" "image url"
async function main(
  noteProjectId = 'your-project-id', // Your GCP Project Id
  noteId = 'my-note-id', // Id of the note
  occurrenceProjectId = 'your-project-id', // GCP Project Id of Occurrence
  imageUrl = 'https://gcr.io/my-project/my-image:123' // Image to attach metadata to
) {
  // [START containeranalysis_create_occurrence]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const noteProjectId = 'your-project-id', // Your GCP Project Id
  // const noteId = 'my-note-id', // Id of the note
  // const occurrenceProjectId = 'your-project-id', // GCP Project Id of Occurrence
  // const imageUrl = 'https://gcr.io/my-project/my-image:123' // Image to attach metadata to

  // Import the library and create a client
  const containerAnalysis = require('@google-cloud/containeranalysis');
  const client = new containerAnalysis.v1beta1.GrafeasV1Beta1Client();

  // Construct request
  const formattedParent = client.projectPath(occurrenceProjectId);
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
  // [END containeranalysis_create_occurrence]
}

main(...process.argv.slice(2));
