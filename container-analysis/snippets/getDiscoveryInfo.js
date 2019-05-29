// sample-metadata:
//   title: Get Discovery Info
//   description: Gets all Discovery Occurrences attached to specified image
//   usage: node getDiscoveryInfo.js
async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  imageUrl = 'https://gcr.io/my-project/my-image:123' // Image to attach metadata to
) {
  // [START containeranalysis_discovery_info]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const imageUrl = 'https://gcr.io/my-project/my-image:123' // Image to attach metadata to

  // Import the library and create a client
  const containerAnalysis = require('@google-cloud/containeranalysis');
  const client = new containerAnalysis.v1beta1.GrafeasV1Beta1Client();

  const formattedParent = client.projectPath(projectId);
  // Retrieves and prints the Discovery Occurrence created for a specified image
  // The Discovery Occurrence contains information about the initial scan on the image
  const [occurrences] = await client.listOccurrences({
    parent: formattedParent,
    filter: `kind = "DISCOVERY" AND resourceUrl = "${imageUrl}"`,
  });

  if (occurrences.length > 0) {
    console.log(`Discovery Occurrences for ${imageUrl}`);
    occurrences.forEach(occurrence => {
      console.log(`${occurrence.name}:`);
      console.log(
        `  Created: ${new Date(occurrence.createTime.seconds * 1000)}`
      );
    });
  } else {
    console.log('No occurrences found.');
  }
  // [END containeranalysis_discovery_info]
}

main(...process.argv.slice(2));
