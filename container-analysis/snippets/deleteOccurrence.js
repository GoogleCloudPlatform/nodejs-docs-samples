// sample-metadata:
//   title: Delete Occurrence
//   description: Deletes a specified Occurrence
//   usage: node deleteOccurrence.js "project-id" "occurrence-id"
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
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  // Get full path to occurrence
  const formattedName = client
    .getGrafeasClient()
    .occurrencePath(projectId, occurrenceId);

  // Deletes an existing Occurrence from the server
  await client.getGrafeasClient().deleteOccurrence({
    name: formattedName,
  });

  console.log(`Occurrence deleted:  ${formattedName}`);
  // [END containeranalysis_delete_occurrence]
}

main(...process.argv.slice(2));
