// [START containeranalysis_pubsub]
// Handle incoming Occurrences using a Cloud Pub/Sub subscription
const occurrencePubSub  = async(
    projectId = 'your-project-id', // Your GCP Project ID
    subscriptionId = 'my-sub-id', // A user-specified identifier for the new subscription
    timeoutSeconds = 'timeout-in-seconds', // The number of seconds to listen for the new Pub/Sub messages
) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_pubsub]

const args = process.argv.slice(2);
occurrencePubSub(...args).catch(console.error);
