// sample-metadata:
//   title: Get Discovery Info
//   description: Gets all Discovery Occurrences attached to specified image
//   usage: node getDiscoveryInfo.js "project-id" "image-url"
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
  const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
  const client = new ContainerAnalysisClient();

  const formattedParent = client.getGrafeasClient().projectPath(projectId);
  // Retrieves and prints the Discovery Occurrence created for a specified image
  // The Discovery Occurrence contains information about the initial scan on the image
  const [occurrences] = await client.getGrafeasClient().listOccurrences({
    parent: formattedParent,
    filter: `kind = "DISCOVERY" AND resourceUrl = "${imageUrl}"`,
  });

  if (occurrences.length > 0) {
    console.log(`Discovery Occurrences for ${imageUrl}`);
    occurrences.forEach(occurrence => {
      console.log(`${occurrence.name}:`);
    });
  } else {
    console.log('No occurrences found.');
  }
  // [END containeranalysis_discovery_info]
}

main(...process.argv.slice(2));
