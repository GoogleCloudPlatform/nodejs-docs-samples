// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

const { BigQuery } = require("@google-cloud/bigquery");

// [START bigquery_view_table_or_view_access_policy]
/**
 * View access policies for a BigQuery table or view
 * 
 * @param {object} [overrideValues] Optional parameters to override defaults
 * @param {string} [overrideValues.projectId] Google Cloud project ID
 * @param {string} [overrideValues.datasetId] Dataset ID where the table or view is located
 * @param {string} [overrideValues.resourceName] Table or view name to get the access policy
 * @throws {Error} If required parameters are missing or if there's an API error
 */

async function viewTableOrViewAccessPolicy(overrideValues = {}) {
    // Initialize default values
    const projectId = overrideValues.projectId || processors.env.GOOGLE_CLOUD_PROJECT;
    const datasetId = overrideValues.datasetId || "my_new_dataset";
    const resourceName = overrideValues.resourceName || "my_table";

    if (!projectId) {
        throw new Error("Project ID is required. Set it in overrideValues or GOOGLE_CLOUD_PROJECT environment variable.")
    }

    try {
        // // Instantiate BigQuery client
        const bigquery = new BigQuery();

        // Get the IAM access policy from the table or view
        const [policy] = await bigquery
            .dataset(datasetId)
            .table(resourceName)
            .getIamPolicy();

        // Show policy details
        console.log(`Access Policy details for table or view '${resourceName}':`);
        console.log(`Bindings: ${JSON.stringify(policy.bindings, null, 2)}`);
        console.log(`etag: ${policy.etag}`);
        console.log(`version: ${policy.version}`);

        return policy;
    } catch (error) {
        console.error(`Error viewing table/view access policy: ${error.message}`);
        throw error;
    }
}
// [END bigquery_view_table_or_view_access_policy]

// If this file is run directly, execute the function with default values
if (require.main === module) {
    viewTableOrViewAccessPolicy().catch(console.error);
}

module.exports = {
    viewTableOrViewAccessPolicy,
};