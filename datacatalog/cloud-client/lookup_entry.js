// This application demonstrates how to perform lookup operations with the
// Cloud Data Catalog API.

// For more information, see the README.md under /datacatalog and the
// documentation at https://cloud.google.com/data-catalog/docs.

async function lookup() {

  // -------------------------------
  // Import required modules.
  // -------------------------------
  const { DataCatalogClient } = require('@google-cloud/datacatalog').v1beta1;
  const datacatalog = new DataCatalogClient();

  // -------------------------------
  // Set your Resource Name.
  // -------------------------------
  // TODO(developer): Uncomment the following lines before running the sample.
  // const projectId = 'my-project'
  // const datasetID = 'my_dataset'
  // const resourceName = `//bigquery.googleapis.com/projects/${projectId}/datasets/${datasetID}`;

  const [result] = await datacatalog.lookupEntry({linkedResource: resourceName});
  return result;
}

lookup().then(response => { console.log(response) });
