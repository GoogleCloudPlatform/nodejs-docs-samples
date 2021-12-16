// Copyright 2021 Google LLC
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

/**
 * Retrieve Compute Engine usage export bucket for the Cloud project.
 * Replaces the empty value returned by the API with the default value used to generate report file names.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 */
function main(projectId) {
  // [START compute_usage_report_get]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const compute = require('@google-cloud/compute');

  async function getUsageExportBucket() {
    // Get the usage export location for the project from the server.
    const projectsClient = new compute.ProjectsClient();
    const [project] = await projectsClient.get({
      project: projectId,
    });

    const usageExportLocation = project.usageExportLocation;

    if (!usageExportLocation || !usageExportLocation.bucketName) {
      // The usage reports are disabled.
      return;
    }

    if (!usageExportLocation.reportNamePrefix) {
      // Although the server explicitly sent the empty string value,
      // the next usage report generated with these settings still has the default prefix value `usage_gce`.
      // (see https://cloud.google.com/compute/docs/reference/rest/v1/projects/get)
      console.log(
        'Report name prefix not set, replacing with default value of `usage_gce`.'
      );
      usageExportLocation.reportNamePrefix = 'usage_gce';
    }

    console.log(
      'Returned reportNamePrefix:',
      usageExportLocation.reportNamePrefix
    );
  }

  getUsageExportBucket();
  // [END compute_usage_report_get]
}

main(...process.argv.slice(2));
