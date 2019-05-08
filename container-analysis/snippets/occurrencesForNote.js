// [START containeranalysis_occurrences_for_note]
// Retrieves all the Occurrences associated with a specified Note
// Here, all Occurrences are printed and counted
const occurrencesForNote = async(

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();

};
// [END containeranalysis_occurrences_for_note]

const args = process.argv.slice(2);
occurrencesForNote(...args).catch(console.error);