// [START containeranalysis_discovery_info]
// Retrieves and prints the Discovery Occurrence created for a specified image
// The Discovery Occurrence contains information about the initial scan on the image
const getDiscoveryInfo = async (

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_discovery_info]

const args = process.argv.slice(2);
getDiscoveryInfo(...args).catch(console.error)