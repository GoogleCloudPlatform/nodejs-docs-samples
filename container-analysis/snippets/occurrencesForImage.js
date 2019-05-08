// [START containeranalysis_occurrences_for_image]
// Retrieves all the Occurrences associated with a specified image
// Here, all Occurrences are simply printed and counted
const occurrencesForImage = async(

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_occurrences_for_image]

const args = process.argv.slice(2);
occurrencesForImage(...args).catch(console.error);

