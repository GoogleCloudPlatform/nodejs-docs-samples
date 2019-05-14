// [START containeranalysis_discovery_info]
// Retrieves and prints the Discovery Occurrence created for a specified image
// The Discovery Occurrence contains information about the initial scan on the image
const getDiscoveryInfo = async (

) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();

    const formattedParent = client.projectPath(projectId);

    const [occurences] = await client.listOccurrences({
        parent: formattedParent,
        // TODO: filter throws invalid argument
        filter: `resourceUrl`
    });

    if (occurrences.length) {
        console.log('Occurrences:');
        occurrences.forEach(occurrence => {
            console.log(`${occurrence.name}:`);
            console.log(`  Created: ${new Date(occurrence.createTime.seconds * 1000)}`)
        });
    } else {
        console.log('No occurrences found.');
    }
};
// [END containeranalysis_discovery_info]

const args = process.argv.slice(2);
getDiscoveryInfo(...args).catch(console.error)