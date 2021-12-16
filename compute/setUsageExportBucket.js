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
 * Set Compute Engine usage export bucket for the Cloud project.
 * This sample presents how to interpret the default value for the report name prefix parameter.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} bucketName - Google Cloud Storage Bucket used to store Compute Engine usage reports. An existing Google Cloud Storage bucket is required.
 * @param {string} reportNamePrefix - Report Name Prefix which defaults to an empty string to showcase default values behaviour.
 */
function main(projectId, bucketName, reportNamePrefix = '') {
  // [START compute_usage_report_set]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const bucketName = 'YOUR_BUCKET_NAME';

  const compute = require('@google-cloud/compute');
  const computeProtos = compute.protos.google.cloud.compute.v1;

  async function setUsageExportBucket() {
    const usageExportLocationResource = new computeProtos.UsageExportLocation();
    usageExportLocationResource.bucketName = bucketName;
    usageExportLocationResource.reportNamePrefix = reportNamePrefix;

    if (!reportNamePrefix) {
      // Sending an empty value for reportNamePrefix results in the next usage report being generated with the default prefix value "usage_gce".
      // (see: https://cloud.google.com/compute/docs/reference/rest/v1/projects/get)
      console.log(
        'Setting reportNamePrefix to empty value causes the report to have the default prefix value `usage_gce`.'
      );
    }

    // Set the usage export location.
    const projectsClient = new compute.ProjectsClient();
    const operationsClient = new compute.GlobalOperationsClient();

    let [operation] = await projectsClient.setUsageExportBucket({
      project: projectId,
      usageExportLocationResource,
    });

    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }
  }

  setUsageExportBucket();
  // [END compute_usage_report_set]
}

main(...process.argv.slice(2));
