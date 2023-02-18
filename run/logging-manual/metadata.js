import got from 'got';

// Load the project ID from GCP metadata server.
// You can also use https://www.npmjs.com/package/gcp-metadata.
exports.getProjectId = async () => {
  const METADATA_PROJECT_ID_URL =
    'http://metadata.google.internal/computeMetadata/v1/project/project-id';
  const options = {
    headers: {'Metadata-Flavor': 'Google'},
  };
  const response = await got(METADATA_PROJECT_ID_URL, options);
  return response.body;
};
