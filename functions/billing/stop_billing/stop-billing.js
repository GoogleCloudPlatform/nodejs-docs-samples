// https://github.com/GoogleCloudPlatform/functions-framework-python
// https://github.com/GoogleCloudPlatform/functions-framework-nodejs

// Simplified representation of `stop_billing` logic
const {CloudBillingClient} = require('@google-cloud/billing');
const functions = require('@google-cloud/functions-framework');
const gcpMetadata = require('gcp-metadata');

const billing = new CloudBillingClient();

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

/*
functions.cloudEvent('StopBillingCloudEvent', async (cloudEvent) => {
  // console.log(cloudEvent);
  const eventData = Buffer.from(
    cloudEvent.data['message']['data'],
    'base64'
  ).toString();

  const eventObject = JSON.parse(eventData);

  console.log(
    `Cost: ${eventObject.costAmount} Budget: ${eventObject.budgetAmount}`
  );

  console.log("Getting billing info for project...");
  console.log("Disabling billing for project...");
  console.log("Billing disabled. (Simulated)");
});
*/

functions.cloudEvent('StopBillingCloudEvent', async cloudEvent => {
  // TODO(developer): As stopping billing is a destructive action
  // for your project, change the following constant to false
  // after you validate with a test budget.
  const simulateDeactivation = true;

  let projectId = PROJECT_ID;

  if (projectId === undefined) {
    try {
      projectId = await gcpMetadata.project('project-id');
    } catch (error) {
      console.error('project-id metadata not found:', error);
      return;
    }
  }

  const projectName = `projects/${projectId}`;

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

  console.log(`Disabling billing for project '${projectName}'...`);

  const billingEnabled = await _isBillingEnabled(projectName);
  if (billingEnabled) {
    _disableBillingForProject(projectName, simulateDeactivation);
  } else {
    console.log('Billing is already disabled.');
  }
});

/**
 * Determine whether billing is enabled for a project
 * @param {string} projectName The name of the project to check
 * @returns {boolean} Whether the project has billing enabled or not
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
 * @param {string} projectName The name of the project to disable billing
 * @param {boolean} simulateDeactivation
 *   If true, it won't actually disable billing.
 *   Useful to validate with test budgets.
 * @returns {void}
 */
const _disableBillingForProject = async (projectName, simulateDeactivation) => {
  if (simulateDeactivation) {
    console.log('Billing disabled. (Simulated)');
    return;
  }

  // Find more information about `projects/updateBillingInfo` API method here:
  // https://cloud.google.com/billing/docs/reference/rest/v1/projects/updateBillingInfo
  try {
    // To disable billing set the `billingAccountName` field to empty
    const requestBody = {billingAccountName: ''};

    const [response] = await billing.updateProjectBillingInfo({
      name: projectName,
      resource: requestBody,
    });

    console.log(`Billing disabled: ${JSON.stringify(response)}`);
  } catch (e) {
    console.log('Failed to disable billing, check permissions.', e);
  }
};