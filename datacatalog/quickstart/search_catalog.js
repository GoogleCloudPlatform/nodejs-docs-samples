// This application demonstrates how to perform search operations with the
// Cloud Data Catalog API.

async function search() {

  // -------------------------------
  // Import required modules.
  // -------------------------------
  const { DataCatalogClient } = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  // -------------------------------
  // Set your Google Cloud Organization ID.
  // -------------------------------
  // TODO: Replace your organization ID in the next line.
  const organizationId = 111111000000;

  // -------------------------------
  // Set your custom query.
  // -------------------------------
  // TODO: If applicable, edit the query string in the next line.
  const query = 'type=dataset'

  // Create request.
  const scope = {
    includeOrgIds: [organizationId],
    // Alternatively, search using project scopes.
    // includeProjectIds: ['my-project'],
  };

  const request = {
    scope: scope,
    query: query,
  };

  const [result] = await datacatalog.searchCatalog(request);
  return result;
}

search().then(response => { console.log(response) });