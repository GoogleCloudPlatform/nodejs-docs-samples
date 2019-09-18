const request = require('got');

// Load the project ID from GCP metadata server.
// You can also use https://www.npmjs.com/package/gcp-metadata.
exports.getProjectId = async () => {
  const METADATA_PROJECT_ID_URL =
    'http://metadata.google.internal/computeMetadata/v1/project/project-id';
  const options = {
    headers: {'Metadata-Flavor': 'Google'},
  };
  const response = await request(METADATA_PROJECT_ID_URL, options);
  return response.body;
};

// Interacting with the Cloud Run API requires an access token.
exports.getServiceUrl = async (project, region, service) => {
  const name = `projects/${project}/locations/${region}/services/${service}`;
  const CLOUD_RUN_API_URL = `https://run.googleapis.com/v1alpha1/${name}`;
  const response = await request(CLOUD_RUN_API_URL);
  return response.body.status.domain;
};
