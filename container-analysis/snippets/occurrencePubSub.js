// [START containeranalysis_pubsub]
// Handle incoming Occurrences using a Cloud Pub/Sub subscription
const occurrencePubSub = async (
  projectId = 'your-project-id', // Your GCP Project ID
  subscriptionId = 'my-sub-id', // A user-specified subscription to the 'container-analysis-occurrences-v1beta' topic
  timeoutSeconds = 'timeout-in-seconds' // The number of seconds to listen for the new Pub/Sub messages
) => {
  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  // Import the pubsub library and create a client, topic and subscription
  const {PubSub} = require('@google-cloud/pubsub');
  const pubsub = new PubSub({projectId});
  const subscription = pubsub.subscription(subscriptionId);

  let count = 0;
  const messageHandler = message => {
    count++;
    message.ack();
  };

  // Listen for new messages until timeout is hit
  subscription.on(`message`, messageHandler);

  setTimeout(() => {
    subscription.removeListener(`message`, messageHandler);
    console.log(`Polled ${count} occurrences`);
  }, timeoutSeconds * 1000);
};
// [END containeranalysis_pubsub]

const args = process.argv.slice(2);
occurrencePubSub(...args).catch(console.error);
