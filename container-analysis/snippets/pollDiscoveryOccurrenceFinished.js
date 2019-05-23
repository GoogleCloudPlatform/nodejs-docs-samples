async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  imageUrl = 'https://gcr.io/my-project/my-image:123', // Image to attach metadata to
  timeoutSeconds = 'timeout-in-seconds' // The number of seconds to listen for the new Pub/Sub messages
) {
  // [START containeranalysis_poll_discovery_occurrence_finished]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const imageUrl = 'https://gcr.io/my-project/my-image:123', // Image to attach metadata to
  // const timeoutSeconds = 'timeout-in-seconds' // The number of seconds to listen for the new Pub/Sub messages

  // Import the library and create a client
  const grafeas = require('@google-cloud/grafeas');
  const client = new grafeas.v1.GrafeasClient();

  const formattedParent = client.projectPath(projectId);

  let filter = `resourceUrl="${imageUrl}" AND noteProjectId="goog-analysis" AND noteId="PACKAGE_VULNERABILITY"`;
  // [END containeranalysis_poll_discovery_occurrence_finished]
  // The above filter isn't testable, since it looks for occurrences in a locked down project
  // Fall back to a more permissive filter for testing
  filter = `kind = "DISCOVERY" AND resourceUrl = "${imageUrl}"`;
  // [START containeranalysis_poll_discovery_occurrence_finished]

  // Repeatedly query the Container Analysis API for the latest discovery occurrence until it is
  // either in a terminal state, or the timeout value has been exceeded
  const pRetry = require('p-retry');
  const discoveryOccurrence = await pRetry(
    async () => {
      const [occurrences] = await client.listOccurrences({
        parent: formattedParent,
        filter: filter,
      });
      if (occurrences.length < 0) {
        throw new Error('No occurrences found for ' + imageUrl);
      }
      return occurrences[0];
    },
    {
      retries: 5,
    }
  );

  console.log(`Polled Discovery Occurrences for ${imageUrl}`);
  // Wait for discovery occurrence to enter a terminal state
  const finishedOccurrence = await pRetry(
    async () => {
      let status = 'PENDING';
      const [updated] = await client.getOccurrence({
        name: discoveryOccurrence.name,
      });
      status = updated.discovered.discovered.analysisStatus;
      if (
        status !== 'FINISHED_SUCCESS' &&
        status !== 'FINISHED_FAILED' &&
        status !== 'FINISHED_UNSUPPORTED'
      ) {
        throw new Error('Timeout while retrieving discovery occurrence');
      }
      return updated;
    },
    {
      retries: 5,
    }
  );
  console.log(
    `Found discovery occurrence ${finishedOccurrence.name}.  Status: ${
      finishedOccurrence.discovered.discovered.analysisStatus
    }`
  );
}
// [END containeranalysis_poll_discovery_occurrence_finished]

main(...process.argv.slice(2));
