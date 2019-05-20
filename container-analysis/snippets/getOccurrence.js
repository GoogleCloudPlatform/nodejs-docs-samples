// [START containeranalysis_get_occurrence]
// Retrieves and prints a specified Occurrence from the server
const getOccurrence = async(
    projectId = 'your-project-id', // Your GCP Project ID
    occurrenceId = 'my-occurrence' // The API-generated identifier associated with the occurrence
) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();

    // Get full path to occurrence
    const formattedName = client.occurrencePath(projectId, occurrenceId)

    // Get occurrence
    const [occurrence] = await client.getOccurrence({
        name: formattedName
    });

    console.log(`Occurrence name: ${occurrence.name}`)

};
// [END containeranalysis_get_occurrence]

const args = process.argv.slice(2);
getOccurrence(...args).catch(console.error)