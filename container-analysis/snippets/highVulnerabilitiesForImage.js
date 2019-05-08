// [START containeranalysis_filter_vulnerability_occurrences]
// Retrieve a list of vulnerability occurrences with a severity level of 'HIGH' or greater
const highVulnerabilitiesForImage = async(

) => {
        // Import the library and create a client
        const grafeas = require('@google-cloud/grafeas');
        const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_filter_vulnerability_occurrences]

const args = process.argv.slice(2);
highVulnerabilitiesForImage(...args).catch(console.error);
