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

// [START functions_billing_stop]
const {CloudBillingClient} = require('@google-cloud/billing');
const functions = require('@google-cloud/functions-framework');
const gcpMetadata = require('gcp-metadata');

const billing = new CloudBillingClient();

functions.cloudEvent('stopBilling', async cloudEvent => {
  let PROJECT_ID;

  try {
    PROJECT_ID = await gcpMetadata.project('project-id');
  } catch (error) {
    console.error('PROJECT_ID not found:', error);
    return;
  }

  const PROJECT_NAME = `projects/${PROJECT_ID}`;

  const eventData = Buffer.from(
    cloudEvent.data['message']['data'],
    'base64'
  ).toString();

  const eventObject = JSON.parse(eventData);

  console.log(
    `Cost: ${eventObject.costAmount} Budget: ${eventObject.budgetAmount}`
  );

  if (eventObject.costAmount <= eventObject.budgetAmount) {
    console.log('No action required. Current cost is within budget.');
    return;
  }

  const billingEnabled = await _isBillingEnabled(PROJECT_NAME);
  if (billingEnabled) {
    _disableBillingForProject(PROJECT_NAME);
  } else {
    console.log('Billing is already disabled.');
  }
});

/**
 * Determine whether billing is enabled for a project
 * @param {string} projectName Name of project to check if billing is enabled
 * @return {bool} Whether project has billing enabled or not
 */
const _isBillingEnabled = async projectName => {
  try {
    console.log(`Getting billing info for project '${projectName}'...`);
    const [res] = await billing.getProjectBillingInfo({name: projectName});

    return res.billingEnabled;
  } catch (e) {
    console.log('Error getting billing info:', e);
    console.log(
      'Unable to determine if billing is enabled on specified project, ' +
        'assuming billing is enabled'
    );

    return true;
  }
};

/**
 * Disable billing for a project by removing its billing account
 * @param {string} projectName Name of project disable billing on
 */
const _disableBillingForProject = async projectName => {
  console.log(`Disabling billing for project '${projectName}'...`);

  // To disable billing set the `billingAccountName` field to empty
  // LINT: Commented out to pass linter
  // const requestBody = {billingAccountName: ''};

  // Find more information about `updateBillingInfo` API method here:
  // https://cloud.google.com/billing/docs/reference/rest/v1/projects/updateBillingInfo

  try {
    // DEBUG: Simulate disabling billing
    console.log('Billing disabled. (Simulated)');

    /*
    const [response] = await billing.updateProjectBillingInfo({
      name: projectName,
      resource: body, // Disable billing
    });

    console.log(`Billing disabled: ${JSON.stringify(response)}`);
    */
  } catch (e) {
    console.log('Failed to disable billing, check permissions.', e);
  }
};
// [END functions_billing_stop]
