async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  occurrenceId = 'my-occurrence' // The API-generated identifier associated with the occurrence
) {
  // [START containeranalysis_delete_occurrence]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const occurrenceId = 'my-occurrence' // The API-generated identifier associated with the occurrence

  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Get full path to occurrence
  const formattedName = client.occurrencePath(projectId, occurrenceId);

  // Deletes an existing Occurrence from the server
  await client.deleteOccurrence({
    name: formattedName,
  });

  console.log(`Occurrence deleted:  ${formattedName}`);
}
// [END containeranalysis_delete_occurrence]

main(...process.argv.slice(2));
