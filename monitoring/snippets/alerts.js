/**
 * Copyright 2018, Google, Inc.
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

/**
 * This application demonstrates how to perform basic operations on alerting
 * policies with the Google Stackdriver Monitoring API.
 *
 * For more information, see https://cloud.google.com/monitoring/docs/.
 */

'use strict';

function backupPolicies(projectId) {
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

  client
    .listAlertPolicies(listAlertPoliciesRequest)
    .then(results => {
      const policies = results[0];

      fs.writeFileSync(
        './policies_backup.json',
        JSON.stringify(policies, null, 2),
        'utf-8'
      );

      console.log('Saved policies to ./policies_backup.json');
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [START monitoring_alert_backup_policies]
}

function restorePolicies(projectId) {
  // Note: The policies are restored one at a time because I get 'service
  //       unavailable' when I try to create multiple alerts simultaneously.
  // [START monitoring_alert_restore_policies]
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

  let promise = Promise.resolve();

  policies.forEach(policy => {
    // Restore each policy one at a time
    promise = promise
      .then(() => doesAlertPolicyExist(policy.name))
      .then(exists => {
        if (exists) {
          return client.updateAlertPolicy({alertPolicy: policy});
        }

        // Clear away output-only fields
        delete policy.name;
        delete policy.creationRecord;
        delete policy.mutationRecord;
        policy.conditions.forEach(condition => delete condition.name);

        return client.createAlertPolicy({
          name: client.projectPath(projectId),
          alertPolicy: policy,
        });
      })
      .then(response => {
        const policy = response[0];
        console.log(`Restored ${policy.name}.`);
      });
  });

  promise.catch(err => {
    console.error('ERROR:', err);
  });

  function doesAlertPolicyExist(name) {
    return client
      .getAlertPolicy({name: name})
      .then(() => true)
      .catch(err => {
        if (err && err.code === 5) {
          // Error code 5 comes from the google.rpc.code.NOT_FOUND protobuf
          return false;
        }
        return Promise.reject(err);
      });
  }
  // [START monitoring_alert_restore_policies]
}

function replaceChannels(projectId, alertPolicyId, channelIds) {
  // [START monitoring_alert_replace_channels]
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
    notificationClient.notificationChannelPath(projectId, id)
  );

  const updateAlertPolicyRequest = {
    updateMask: {paths: ['notification_channels']},
    alertPolicy: {
      name: alertClient.alertPolicyPath(projectId, alertPolicyId),
      notificationChannels: notificationChannels,
    },
  };

  alertClient
    .updateAlertPolicy(updateAlertPolicyRequest)
    .then(results => {
      const alertPolicy = results[0];
      console.log(`Updated ${alertPolicy.name}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_alert_replace_channels]
}

function disablePolicies(projectId, filter) {
  // [START monitoring_alert_disable_policies]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const filter = 'A filter for selecting policies, e.g. user_labels="active"';

  const listAlertPoliciesRequest = {
    name: client.projectPath(projectId),
    // See https://cloud.google.com/monitoring/alerting/docs/sorting-and-filtering
    filter: filter,
  };

  client
    .listAlertPolicies(listAlertPoliciesRequest)
    .then(results => {
      const policies = results[0];

      const tasks = policies
        .map(policy => {
          return {
            updateMask: {paths: ['disabled']},
            alertPolicy: {
              name: policy.name,
              disabled: true,
            },
          };
        })
        .map(updateAlertPolicyRequest => {
          return client.updateAlertPolicy(updateAlertPolicyRequest);
        });

      // Wait for all policies to be disabled
      return Promise.all(tasks);
    })
    .then(responses => {
      responses.forEach(response => {
        const alertPolicy = response[0];
        console.log(`Disabled ${alertPolicy.name}.`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_alert_disable_policies]
}

function enablePolicies(projectId, filter) {
  // [START monitoring_alert_enable_policies]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const filter = 'A filter for selecting policies, e.g. description:"cloud"';

  const listAlertPoliciesRequest = {
    name: client.projectPath(projectId),
    // See https://cloud.google.com/monitoring/alerting/docs/sorting-and-filtering
    filter: filter,
  };

  client
    .listAlertPolicies(listAlertPoliciesRequest)
    .then(results => {
      const policies = results[0];

      const tasks = policies
        .map(policy => {
          return {
            updateMask: {paths: ['disabled']},
            alertPolicy: {
              name: policy.name,
              disabled: false,
            },
          };
        })
        .map(updateAlertPolicyRequest =>
          client.updateAlertPolicy(updateAlertPolicyRequest)
        );

      // Wait for all policies to be enabled
      return Promise.all(tasks);
    })
    .then(responses => {
      responses.forEach(response => {
        const alertPolicy = response[0];
        console.log(`Enabled ${alertPolicy.name}.`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_alert_enable_policies]
}

require(`yargs`)
  .demand(1)
  .command(
    `backup <projectId>`,
    `Save alert policies to a ./policies_backup.json file.`,
    {},
    opts => backupPolicies(opts.projectId, opts.filter || '')
  )
  .command(
    `restore <projectId>`,
    `Restore alert policies from a ./policies_backup.json file.`,
    {},
    opts => restorePolicies(opts.projectId, opts.filter || '')
  )
  .command(
    `replace <alertPolicyName> <channelNames..>`,
    `Replace the notification channels of the specified alert policy.`,
    {},
    opts => {
      const parts = opts.alertPolicyName.split('/');
      const channelIds = opts.channelNames.map(name => name.split('/')[3]);
      replaceChannels(parts[1], parts[3], channelIds);
    }
  )
  .command(
    `disable <projectId> [filter]`,
    `Disables policies that match the given filter.`,
    {},
    opts => disablePolicies(opts.projectId, opts.filter || ``)
  )
  .command(
    `enable <projectId> [filter]`,
    `Enables policies that match the given filter.`,
    {},
    opts => enablePolicies(opts.projectId, opts.filter || ``)
  )
  .options({
    alertPolicyName: {
      type: 'string',
      requiresArg: true,
    },
  })
  .example(`node $0 backup my-project-id`, `Backup policies.`)
  .example(`node $0 restore my-project-id`, `Restore policies.`)
  .example(
    `node $0 replace projects/my-project-id/alertPolicies/12345 channel-1 channel-2 channel-3`,
    `Replace the notification channels of the specified alert policy.`
  )
  .example(
    `node $0 disable my-project-id "(NOT display_name.empty OR NOT description.empty) AND user_labels='active'"`,
    `Disables policies that match the given filter.`
  )
  .example(
    `node $0 disable my-project-id "description:'cloud'"`,
    `Disables policies that match the given filter.`
  )
  .example(
    `node $0 disable my-project-id "display_name=monitoring.regex.full_match('Temp \\d{4}')"`,
    `Disables policies that match the given filter.`
  )
  .example(
    `node $0 enable my-project-id "(NOT display_name.empty OR NOT description.empty) AND user_labels='active'"`,
    `Enables policies that match the given filter.`
  )
  .example(
    `node $0 enable my-project-id "description:'cloud'"`,
    `Enables policies that match the given filter.`
  )
  .example(
    `node $0 enable my-project-id "display_name=monitoring.regex.full_match('Temp \\d{4}')"`,
    `Enables policies that match the given filter.`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/monitoring/docs/`
  )
  .help()
  .strict().argv;
