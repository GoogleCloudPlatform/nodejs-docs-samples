/**
 * Copyright 2018, Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START functions_billing_limit]
// [START functions_billing_stop]
const { google } = require('googleapis');
const { auth } = require('google-auth-library');

const PROJECT_ID = process.env.GCP_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
// [END functions_billing_stop]
// [END functions_billing_limit]

// [START functions_billing_slack]
const slack = require('slack');

const BOT_ACCESS_TOKEN = 'xxxx-111111111111-abcdefghidklmnopq';
const CHANNEL = 'general';

exports.notifySlack = async (data, context) => {
  const pubsubMessage = data;
  const pubsubAttrs = JSON.stringify(pubsubMessage.attributes);
  const pubsubData = Buffer.from(pubsubMessage.data, 'base64').toString();
  const budgetNotificationText = `${pubsubAttrs}, ${pubsubData}`;

  const res = await slack.chat.postMessage({
    token: BOT_ACCESS_TOKEN,
    channel: CHANNEL,
    text: budgetNotificationText
  });
  console.log(res);
};
// [END functions_billing_slack]

// [START functions_billing_stop]
const billing = google.cloudbilling('v1').projects;

exports.stopBilling = async (data, context) => {
  const pubsubData = JSON.parse(Buffer.from(data.data, 'base64').toString());
  if (pubsubData.costAmount <= pubsubData.budgetAmount) {
    return `No action necessary. (Current cost: ${pubsubData.costAmount})`;
  }

  await _setAuthCredential();
  if (await _isBillingEnabled(PROJECT_NAME)) {
    return _disableBillingForProject(PROJECT_NAME);
  } else {
    return 'Billing already disabled';
  }
};

/**
 * @return {Promise} Credentials set globally
 */
const _setAuthCredential = async () => {
  const res = await auth.getApplicationDefault();

  let client = res.credential;
  if (client.hasScopes && !client.hasScopes()) {
    client = client.createScoped([
      'https://www.googleapis.com/auth/cloud-billing',
      'https://www.googleapis.com/auth/cloud-platform'
    ]);
  }

  // Set credential globally for all requests
  google.options({
    auth: client
  });
};

/**
 * Determine whether billing is enabled for a project
 * @param {string} projectName Name of project to check if billing is enabled
 * @return {bool} Whether project has billing enabled or not
 */
const _isBillingEnabled = async (projectName) => {
  const res = await billing.getBillingInfo({ name: projectName });
  return res.data.billingEnabled;
};

/**
 * Disable billing for a project by removing its billing account
 * @param {string} projectName Name of project disable billing on
 * @return {string} Text containing response from disabling billing
 */
const _disableBillingForProject = async (projectName) => {
  const res = await billing.updateBillingInfo({
    name: projectName,
    resource: { 'billingAccountName': '' } // Disable billing
  });
  return `Billing disabled: ${JSON.stringify(res.data)}`;
};
// [END functions_billing_stop]

// [START functions_billing_limit]
const compute = google.compute('v1');
const ZONE = 'us-west1-b';

exports.limitUse = async (data, context) => {
  const pubsubData = JSON.parse(Buffer.from(data.data, 'base64').toString());
  if (pubsubData.costAmount <= pubsubData.budgetAmount) {
    return `No action necessary. (Current cost: ${pubsubData.costAmount})`;
  }

  await _setAuthCredential();
  const instanceNames = await _listRunningInstances(PROJECT_ID, ZONE);
  await _stopInstances(PROJECT_ID, ZONE, instanceNames);
};

/**
 * @return {Promise} Array of names of running instances
 */
const _listRunningInstances = async (projectId, zone) => {
  const res = await compute.instances.list({
    project: projectId,
    zone: zone
  });

  const instances = res.data.items || [];
  const ranInstances = instances.filter(item => item.status === 'RUNNING');
  return ranInstances.map(item => item.name);
};

/**
 * @param {Array} instanceNames Names of instance to stop
 * @return {Promise} Response from stopping instances
 */
const _stopInstances = async (projectId, zone, instanceNames) => {
  if (!instanceNames.length) {
    return 'No running instances were found.';
  }
  await Promise.all(instanceNames.map(instanceName => {
    return compute.instances.stop({
      project: projectId,
      zone: zone,
      instance: instanceName
    }).then((res) => {
      console.log('Instance stopped successfully: ' + instanceName);
      return res.data;
    });
  }));
};
// [END functions_billing_limit]
