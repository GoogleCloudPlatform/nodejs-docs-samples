// Copyright 2019 Google LLC
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

// [START functions_billing_limit]
// [START functions_billing_stop]
const google_billing = require('googleapis/build/src/apis/cloudbilling');
const google_compute = require('googleapis/build/src/apis/compute');
const {GoogleAuth} = require('google-auth-library');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
// [END functions_billing_stop]
// [END functions_billing_limit]

// [START functions_billing_slack]
const slack = require('slack');

// TODO(developer) replace these with your own values
const BOT_ACCESS_TOKEN =
  process.env.BOT_ACCESS_TOKEN || 'xxxx-111111111111-abcdefghidklmnopq';
const CHANNEL = process.env.SLACK_CHANNEL || 'general';

exports.notifySlack = async pubsubEvent => {
  const pubsubAttrs = pubsubEvent.attributes;
  const pubsubData = Buffer.from(pubsubEvent.data, 'base64').toString();
  const budgetNotificationText = `${JSON.stringify(
    pubsubAttrs
  )}, ${pubsubData}`;

  await slack.chat.postMessage({
    token: BOT_ACCESS_TOKEN,
    channel: CHANNEL,
    text: budgetNotificationText,
  });

  return 'Slack notification sent successfully';
};
// [END functions_billing_slack]

// [START functions_billing_stop]
const billing = google_billing.cloudbilling('v1');

exports.stopBilling = async pubsubEvent => {
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data, 'base64').toString()
  );
  if (pubsubData.costAmount <= pubsubData.budgetAmount) {
    return `No action necessary. (Current cost: ${pubsubData.costAmount})`;
  }

  if (!PROJECT_ID) {
    return 'No project specified';
  }

  _setAuthCredential();
  const billingEnabled = await _isBillingEnabled(PROJECT_NAME);
  if (billingEnabled) {
    return _disableBillingForProject(PROJECT_NAME);
  } else {
    return 'Billing already disabled';
  }
};

// [START functions_billing_limit]
/**
 * @return {Promise} Credentials set globally
 */
const _setAuthCredential = () => {
  const client = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/cloud-billing',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  });

  // Set credentials
  google_compute.auth = client;
  google_billing._options = {
    // Required monkeypatch
    auth: client,
  };
};
// [END functions_billing_limit]

/**
 * Determine whether billing is enabled for a project
 * @param {string} projectName Name of project to check if billing is enabled
 * @return {bool} Whether project has billing enabled or not
 */
const _isBillingEnabled = async projectName => {
  try {
    const res = await billing.projects.getBillingInfo({name: projectName});
    return res.data.billingEnabled;
  } catch (e) {
    console.log(
      'Unable to determine if billing is enabled on specified project, assuming billing is enabled'
    );
    return true;
  }
};

/**
 * Disable billing for a project by removing its billing account
 * @param {string} projectName Name of project disable billing on
 * @return {string} Text containing response from disabling billing
 */
const _disableBillingForProject = async projectName => {
  const res = await billing.projects.updateBillingInfo({
    name: projectName,
    resource: {billingAccountName: ''}, // Disable billing
  });
  return `Billing disabled: ${JSON.stringify(res.data)}`;
};
// [END functions_billing_stop]

// Helper function to restart billing (used in tests)
exports.startBilling = async pubsubEvent => {
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data, 'base64').toString()
  );

  _setAuthCredential();
  if (!(await _isBillingEnabled(PROJECT_NAME))) {
    // Enable billing

    const res = await billing.projects.updateBillingInfo({
      name: pubsubData.projectName,
      resource: {
        billingAccountName: pubsubData.billingAccountName,
        billingEnabled: true,
      },
    });
    return `Billing enabled: ${JSON.stringify(res.data)}`;
  } else {
    return 'Billing already enabled';
  }
};

// [START functions_billing_limit]
const compute = google_compute.compute('v1');
const ZONE = 'us-central1-a';

exports.limitUse = async pubsubEvent => {
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data, 'base64').toString()
  );
  if (pubsubData.costAmount <= pubsubData.budgetAmount) {
    return `No action necessary. (Current cost: ${pubsubData.costAmount})`;
  }

  _setAuthCredential();

  const instanceNames = await _listRunningInstances(PROJECT_ID, ZONE);
  if (!instanceNames.length) {
    return 'No running instances were found.';
  }

  await _stopInstances(PROJECT_ID, ZONE, instanceNames);
  return `${instanceNames.length} instance(s) stopped successfully.`;
};

/**
 * @return {Promise} Array of names of running instances
 */
const _listRunningInstances = async (projectId, zone) => {
  const res = await compute.instances.list({
    project: projectId,
    zone: zone,
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
  await Promise.all(
    instanceNames.map(instanceName => {
      return compute.instances
        .stop({
          project: projectId,
          zone: zone,
          instance: instanceName,
        })
        .then(res => {
          console.log(`Instance stopped successfully: ${instanceName}`);
          return res.data;
        });
    })
  );
};
// [END functions_billing_limit]

// Helper function to restart instances (used in tests)
exports.startInstances = async () => {
  _setAuthCredential();
  const instanceNames = await _listStoppedInstances(PROJECT_ID, ZONE);

  if (!instanceNames.length) {
    return 'No stopped instances were found.';
  }

  await _startInstances(PROJECT_ID, ZONE, instanceNames);
  return `${instanceNames.length} instance(s) started successfully.`;
};

/**
 * @return {Promise} Array of names of running instances
 */
const _listStoppedInstances = async (projectId, zone) => {
  const res = await compute.instances.list({
    project: projectId,
    zone: zone,
  });

  const instances = res.data.items || [];
  const stoppedInstances = instances.filter(item => item.status !== 'RUNNING');
  return stoppedInstances.map(item => item.name);
};

/**
 * @param {Array} instanceNames Names of instance to stop
 * @return {Promise} Response from stopping instances
 */
const _startInstances = async (projectId, zone, instanceNames) => {
  if (!instanceNames.length) {
    return 'No stopped instances were found.';
  }
  await Promise.all(
    instanceNames.map(instanceName => {
      return compute.instances.start({
        project: projectId,
        zone: zone,
        instance: instanceName,
      });
    })
  );
};

// Helper function used in tests
exports.listRunningInstances = async () => {
  _setAuthCredential();
  console.log(PROJECT_ID, ZONE);
  return _listRunningInstances(PROJECT_ID, ZONE);
};
