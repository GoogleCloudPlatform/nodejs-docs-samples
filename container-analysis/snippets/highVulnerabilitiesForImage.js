// [START containeranalysis_filter_vulnerability_occurrences]
// Retrieve a list of vulnerability occurrences with a severity level of 'HIGH' or greater
const highVulnerabilitiesForImage = async (

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
// [END containeranalysis_filter_vulnerability_occurrences]

const args = process.argv.slice(2);
highVulnerabilitiesForImage(...args).catch(console.error);
