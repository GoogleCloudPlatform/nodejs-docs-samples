// [START containeranalysis_filter_vulnerability_occurrences]
// Retrieve a list of vulnerability occurrences with a severity level of 'HIGH' or greater
const highVulnerabilitiesForImage = async (
    projectId = 'your-project-id', // Your GCP Project ID
    imageUrl = 'https://gcr.io/my-project/my-image:123' // Image to attach metadata to
) => {
        // Import the library and create a client
        const grafeas = require('@google-cloud/grafeas');
        const client = new grafeas.v1.GrafeasClient();

        const formattedParent = client.projectPath(projectId);

        const [occurrences] = await client.listOccurrences({
                parent: formattedParent,
                filter: `kind = "VULNERABILITY" AND resourceUrl = "${imageUrl}"`
        });

        if (occurrences.length) {
                console.log(`High Severity Vulnerabilities for ${imageUrl}`);
                occurrences.forEach(occurrence => {
                        if (occurrence.vulnerability.severity == 'HIGH' || occurrence.vulnerability.severity == 'CRITICAL') {
                        console.log(`${occurrence.name}:`);
                        console.log(`  Created: ${new Date(occurrence.createTime.seconds * 1000)}`)
                        }
                });
        } else {
                console.log('No occurrences found.');
        }
};
// [END containeranalysis_filter_vulnerability_occurrences]

const args = process.argv.slice(2);
highVulnerabilitiesForImage(...args).catch(console.error);
