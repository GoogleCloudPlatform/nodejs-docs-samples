// [START containeranalysis_get_occurrence]
// Retrieves and prints a specified Occurrence from the server
const getOccurrence = async(

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_get_occurrence]

const args = process.argv.slice(2);
getOccurrence(...args).catch(console.error)