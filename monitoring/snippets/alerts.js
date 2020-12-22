// Copyright 2018 Google LLC
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
 * This application demonstrates how to perform basic operations on alerting
 * policies with the Google Stackdriver Monitoring API.
 *
 * For more information, see https://cloud.google.com/monitoring/docs/.
 */

'use strict';

async function backupPolicies(projectId) {
  // [START monitoring_alert_backup_policies]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const listAlertPoliciesRequest = {
    name: client.projectPath(projectId),
  };

  let [policies] = await client.listAlertPolicies(listAlertPoliciesRequest);

  // filter out any policies created by tests for this sample
  policies = policies.filter(policy => {
    return !policy.displayName.startsWith('gcloud-tests-');
  });

  fs.writeFileSync(
    './policies_backup.json',
    JSON.stringify(policies, null, 2),
    'utf-8'
  );

  console.log('Saved policies to ./policies_backup.json');
  // [END monitoring_alert_backup_policies]
}

async function restorePolicies(projectId) {
  // Note: The policies are restored one at a time because I get 'service
  //       unavailable' when I try to create multiple alerts simultaneously.
  // [START monitoring_alert_restore_policies]
  // [START monitoring_alert_create_policy]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  console.log('Loading policies from ./policies_backup.json');
  const fileContent = fs.readFileSync('./policies_backup.json', 'utf-8');
  const policies = JSON.parse(fileContent);

  for (const index in policies) {
    // Restore each policy one at a time
    let policy = policies[index];
    if (await doesAlertPolicyExist(policy.name)) {
      policy = await client.updateAlertPolicy({
        alertPolicy: policy,
      });
    } else {
      // Clear away output-only fields
      delete policy.name;
      delete policy.creationRecord;
      delete policy.mutationRecord;
      policy.conditions.forEach(condition => delete condition.name);

      policy = await client.createAlertPolicy({
        name: client.projectPath(projectId),
        alertPolicy: policy,
      });
    }

    console.log(`Restored ${policy[0].name}.`);
  }
  async function doesAlertPolicyExist(name) {
    try {
      const [policy] = await client.getAlertPolicy({
        name,
      });
      return policy ? true : false;
    } catch (err) {
      if (err && err.code === 5) {
        // Error code 5 comes from the google.rpc.code.NOT_FOUND protobuf
        return false;
      }
      throw err;
    }
  }
  // [END monitoring_alert_create_policy]
  // [END monitoring_alert_restore_policies]
}

async function deleteChannels(projectId, filter) {
  // [START monitoring_alert_delete_channel]
  // [START monitoring_alert_list_channels]

  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.NotificationChannelServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const filter = 'A filter for selecting policies, e.g. description:"cloud"';

  const request = {
    name: client.projectPath(projectId),
    filter,
  };
  const channels = await client.listNotificationChannels(request);
  console.log(channels);
  for (const channel of channels[0]) {
    console.log(`Deleting channel ${channel.displayName}`);
    try {
      await client.deleteNotificationChannel({
        name: channel.name,
      });
    } catch (err) {
      // ignore error
    }
  }
  // [END monitoring_alert_delete_channel]
  // [END monitoring_alert_list_channels]
}

async function replaceChannels(projectId, alertPolicyId, channelIds) {
  // [START monitoring_alert_replace_channels]
  // [START monitoring_alert_enable_channel]
  // [START monitoring_alert_update_channel]
  // [START monitoring_alert_create_channel]

  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates clients
  const alertClient = new monitoring.AlertPolicyServiceClient();
  const notificationClient = new monitoring.NotificationChannelServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const alertPolicyId = '123456789012314';
  // const channelIds = [
  //   'channel-1',
  //   'channel-2',
  //   'channel-3',
  // ];

  const notificationChannels = channelIds.map(id =>
    notificationClient.projectNotificationChannelPath(projectId, id)
  );

  for (const channel of notificationChannels) {
    const updateChannelRequest = {
      updateMask: {
        paths: ['enabled'],
      },
      notificationChannel: {
        name: channel,
        enabled: {
          value: true,
        },
      },
    };
    try {
      await notificationClient.updateNotificationChannel(updateChannelRequest);
    } catch (err) {
      const createChannelRequest = {
        notificationChannel: {
          name: channel,
          notificationChannel: {
            type: 'email',
          },
        },
      };
      const newChannel = await notificationClient.createNotificationChannel(
        createChannelRequest
      );
      notificationChannels.push(newChannel);
    }
  }

  const updateAlertPolicyRequest = {
    updateMask: {
      paths: ['notification_channels'],
    },
    alertPolicy: {
      name: alertClient.projectAlertPolicyPath(projectId, alertPolicyId),
      notificationChannels: notificationChannels,
    },
  };
  const [alertPolicy] = await alertClient.updateAlertPolicy(
    updateAlertPolicyRequest
  );
  console.log(`Updated ${alertPolicy.name}.`);
  // [END monitoring_alert_replace_channels]
  // [END monitoring_alert_enable_channel]
  // [END monitoring_alert_update_channel]
  // [END monitoring_alert_create_channel]
}

async function enablePolicies(projectId, enabled, filter) {
  // [START monitoring_alert_enable_policies]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const enabled = true;
  // const filter = 'A filter for selecting policies, e.g. description:"cloud"';

  const listAlertPoliciesRequest = {
    name: client.projectPath(projectId),
    // See https://cloud.google.com/monitoring/alerting/docs/sorting-and-filtering
    filter: filter,
  };

  const [policies] = await client.listAlertPolicies(listAlertPoliciesRequest);
  const responses = [];
  for (const policy of policies) {
    responses.push(
      await client.updateAlertPolicy({
        updateMask: {
          paths: ['enabled'],
        },
        alertPolicy: {
          name: policy.name,
          enabled: {
            value: enabled,
          },
        },
      })
    );
  }
  responses.forEach(response => {
    const alertPolicy = response[0];
    console.log(`${enabled ? 'Enabled' : 'Disabled'} ${alertPolicy.name}.`);
  });
  // [END monitoring_alert_enable_policies]
}

async function listPolicies(projectId) {
  // [START monitoring_alert_list_policies]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const listAlertPoliciesRequest = {
    name: client.projectPath(projectId),
  };
  const [policies] = await client.listAlertPolicies(listAlertPoliciesRequest);
  console.log('Policies:');
  policies.forEach(policy => {
    console.log(`  Display name: ${policy.displayName}`);
    if (policy.documentation && policy.documentation.content) {
      console.log(`     Documentation: ${policy.documentation.content}`);
    }
  });

  // [END monitoring_alert_list_policies]
}

require('yargs')
  .demand(1)
  .command(
    'backup <projectId>',
    'Save alert policies to a ./policies_backup.json file.',
    {},
    opts => backupPolicies(opts.projectId, opts.filter || '')
  )
  .command(
    'restore <projectId>',
    'Restore alert policies from a ./policies_backup.json file.',
    {},
    opts => restorePolicies(opts.projectId, opts.filter || '')
  )
  .command(
    'replace <alertPolicyName> <channelNames..>',
    'Replace the notification channels of the specified alert policy.',
    {},
    opts => {
      const parts = opts.alertPolicyName.split('/');
      const channelIds = opts.channelNames.map(name => name.split('/')[3]);
      replaceChannels(parts[1], parts[3], channelIds);
    }
  )
  .command(
    'disable <projectId> [filter]',
    'Disables policies that match the given filter.',
    {},
    opts => enablePolicies(opts.projectId, false, opts.filter || '')
  )
  .command(
    'enable <projectId> [filter]',
    'Enables policies that match the given filter.',
    {},
    opts => enablePolicies(opts.projectId, true, opts.filter || '')
  )
  .command(
    'list <projectId>',
    'Lists alert policies in the specified project.',
    {},
    opts => listPolicies(opts.projectId)
  )
  .command(
    'deleteChannels <projectId> [filter]',
    'Lists and deletes all channels in the specified project.',
    {},
    opts => deleteChannels(opts.projectId, opts.filter || '')
  )
  .options({
    alertPolicyName: {
      type: 'string',
      requiresArg: true,
    },
  })
  .example('node $0 backup my-project-id', 'Backup policies.')
  .example('node $0 restore my-project-id', 'Restore policies.')
  .example(
    'node $0 replace projects/my-project-id/alertPolicies/12345 channel-1 channel-2 channel-3',
    'Replace the notification channels of the specified alert policy.'
  )
  .example(
    'node $0 disable my-project-id "(NOT display_name.empty OR NOT description.empty) AND user_labels=\'active\'"',
    'Disables policies that match the given filter.'
  )
  .example(
    'node $0 disable my-project-id "description:\'cloud\'"',
    'Disables policies that match the given filter.'
  )
  .example(
    'node $0 disable my-project-id "display_name=monitoring.regex.full_match(\'Temp \\d{4}\')"',
    'Disables policies that match the given filter.'
  )
  .example(
    'node $0 enable my-project-id "(NOT display_name.empty OR NOT description.empty) AND user_labels=\'active\'"',
    'Enables policies that match the given filter.'
  )
  .example(
    'node $0 enable my-project-id "description:\'cloud\'"',
    'Enables policies that match the given filter.'
  )
  .example(
    'node $0 enable my-project-id "display_name=monitoring.regex.full_match(\'Temp \\d{4}\')"',
    'Enables policies that match the given filter.'
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    'For more information, see https://cloud.google.com/monitoring/docs/'
  )
  .help()
  .strict().argv;
