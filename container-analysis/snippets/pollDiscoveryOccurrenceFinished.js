// [START containeranalysis_poll_discovery_occurrence_finished]i
// Repeatedly query the Container Analysis API for the latest discovery occurrence until it is
// either in a terminal state, or the timeout value has been exceeded
const pollDiscoveryOccurrenceFinished = async (

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();
};
// [END containeranalysis_poll_discovery_occurrence_finished]

const args = process.argv.slice(2);
pollDiscoveryOccurrenceFinished(...args).catch(console.error);