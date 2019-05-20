// [START containeranalysis_delete_occurrence]
// Deletes an existing Occurrence from the server
async function deleteOccurrence(
  projectId = 'your-project-id', // Your GCP Project ID
  occurrenceId = 'my-occurrence' // Your Occurrence name
) {
  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Get full path to occurrence
  const formattedName = client.occurrencePath(projectId, occurrenceId);

  const result = await client.deleteOccurrence({
    name: formattedName,
  });

  console.log(`Occurrence deleted:  ${formattedName}`);
}
// [END containeranalysis_delete_occurrence]

const args = process.argv.slice(2);
deleteOccurrence(...args).catch(console.error);
