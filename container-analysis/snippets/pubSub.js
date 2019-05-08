// [START containeranalysis_pubsub]
// Handle incoming Occurrences using a Cloud Pub/Sub subscription
const pubSub = async(

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_pubsub]

const args = process.argv.slice(2);
pubSub(...args).catch(console.error);
