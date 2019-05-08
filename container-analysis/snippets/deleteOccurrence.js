// [START containeranalysis_delete_occurrence]
// Deletes an existing Occurrence from the server
const deleteOccurrence = async (

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_delete_occurrence]

const args = process.argv.slice(2);
deleteOccurrence()