// sample-metadata:
//   title: Get Occurrence
//   description: Retrieves and prints a specified Occurrence
//   usage: node getOccurrence.js "project-id" "occurrence-id"
async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  occurrenceId = 'my-occurrence' // The API-generated identifier associated with the occurrence
) {
  // [START containeranalysis_get_occurrence]
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

  // Retrieves the specified occurrence
  const [occurrence] = await client.getGrafeasClient().getOccurrence({
    name: formattedName,
  });

  console.log(`Occurrence name: ${occurrence.name}`);
  // [END containeranalysis_get_occurrence]
}

main(...process.argv.slice(2));
