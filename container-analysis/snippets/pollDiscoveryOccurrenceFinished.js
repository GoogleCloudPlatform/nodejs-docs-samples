// [START containeranalysis_poll_discovery_occurrence_finished]
// Repeatedly query the Container Analysis API for the latest discovery occurrence until it is
// either in a terminal state, or the timeout value has been exceeded
const pollDiscoveryOccurrenceFinished = async (
  projectId = 'your-project-id', // Your GCP Project ID
  imageUrl = 'https://gcr.io/my-project/my-image:123', // Image to attach metadata to
  timeoutSeconds = 'timeout-in-seconds' // The number of seconds to listen for the new Pub/Sub messages
) => {
  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  const formattedParent = client.projectPath(projectId);

  let filter = `resourceUrl=\"${imageUrl}\" AND noteProjectId=\"goog-analysis\" AND noteId=\"PACKAGE_VULNERABILITY\"`;
  // [END containeranalysis_poll_discovery_occurrence_finished]
  // The above filter isn't testable, since it looks for occurrences in a locked down project
  // Fall back to a more permissive filter for testing
  filter = `kind = \"DISCOVERY\" AND resourceUrl = \"${imageUrl}\"`;
  // [START containeranalysis_poll_discovery_occurrence_finished]

  const pollDiscoveryOccurrence = () => {
    return new Promise(async (resolve, reject) => {
      setTimeout(() => {
        reject('Timeout while retrieving discovery occurrence.');
      }, timeoutSeconds * 1000);
      let found = false;
      while (found == false) {
        const [discoveryOccurrences] = await client.listOccurrences({
          parent: formattedParent,
          filter: filter,
        });
        if (discoveryOccurrences.length > 0) {
          found = true;
          clearTimeout();
          resolve(discoveryOccurrences);
        }
      }
    });
  };
  pollDiscoveryOccurrence()
    .then(result => {
      console.log(`Polled Discovery Occurrences for ${imageUrl}`);
      result.forEach(occurrence => {
        console.log(`${occurrence.name}:`);
        console.log(
          `  Created: ${new Date(occurrence.createTime.seconds * 1000)}`
        );
      });
    })
    .catch(err => {
      console.log(err);
    });
};
// [END containeranalysis_poll_discovery_occurrence_finished]

const args = process.argv.slice(2);
pollDiscoveryOccurrenceFinished(...args).catch(console.error);
