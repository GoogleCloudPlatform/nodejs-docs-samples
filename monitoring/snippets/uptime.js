/**
 * Copyright 2017, Google, Inc.
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
 * This application demonstrates how to perform basic operations on uptime check
 * configs with the Google Stackdriver Monitoring API.
 *
 * For more information, see the README.md under /monitoring and the
 * documentation at https://cloud.google.com/monitoring/uptime-checks/.
 */

'use strict';

function createUptimeCheckConfig(projectId, gceInstanceId) {
  // [START monitoring_uptime_check_create]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.UptimeCheckServiceClient();

  /**
   * TODO(developer): Uncomment and edit the following lines of code.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const gceInstanceId = 'my-instance';

  const request = {
    // i.e. parent: 'projects/my-project-id'
    parent: client.projectPath(projectId),
    uptimeCheckConfig: {
      displayName: 'My GCE Instance Uptime Check',
      monitoredResource: {
        // See the Uptime Check docs for supported MonitoredResource types
        type: 'gce_instance',
        labels: {instance_id: gceInstanceId},
      },
      httpCheck: {path: '/', port: 80},
      timeout: {seconds: 10},
      period: {seconds: 300},
    },
  };

  // Creates an uptime check config for a GCE instance
  client
    .createUptimeCheckConfig(request)
    .then(results => {
      const uptimeCheckConfig = results[0];

      console.log('Uptime check created:');
      console.log(`ID: ${uptimeCheckConfig.name}`);
      console.log(`Display Name: ${uptimeCheckConfig.displayName}`);
      console.log(`Resource: %j`, uptimeCheckConfig.monitoredResource);
      console.log(`Period: %j`, uptimeCheckConfig.period);
      console.log(`Timeout: %j`, uptimeCheckConfig.timeout);
      console.log(`Check type: ${uptimeCheckConfig.check_request_type}`);
      console.log(
        `Check: %j`,
        uptimeCheckConfig.httpCheck || uptimeCheckConfig.tcpCheck
      );
      console.log(
        `Content matchers: ${uptimeCheckConfig.contentMatchers
          .map(matcher => matcher.content)
          .join(', ')}`
      );
      console.log(`Regions: ${uptimeCheckConfig.selectedRegions.join(', ')}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_uptime_check_create]
}

function listUptimeCheckConfigs(projectId) {
  // [START monitoring_uptime_check_list_configs]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.UptimeCheckServiceClient();

  /**
   * TODO(developer): Uncomment and edit the following lines of code.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const request = {
    parent: client.projectPath(projectId),
  };

  // Retrieves an uptime check config
  client
    .listUptimeCheckConfigs(request)
    .then(results => {
      const uptimeCheckConfigs = results[0];

      uptimeCheckConfigs.forEach(uptimeCheckConfig => {
        console.log(`ID: ${uptimeCheckConfig.name}`);
        console.log(`  Display Name: ${uptimeCheckConfig.displayName}`);
        console.log(`  Resource: %j`, uptimeCheckConfig.monitoredResource);
        console.log(`  Period: %j`, uptimeCheckConfig.period);
        console.log(`  Timeout: %j`, uptimeCheckConfig.timeout);
        console.log(`  Check type: ${uptimeCheckConfig.check_request_type}`);
        console.log(
          `  Check: %j`,
          uptimeCheckConfig.httpCheck || uptimeCheckConfig.tcpCheck
        );
        console.log(
          `  Content matchers: ${uptimeCheckConfig.contentMatchers
            .map(matcher => matcher.content)
            .join(', ')}`
        );
        console.log(
          `  Regions: ${uptimeCheckConfig.selectedRegions.join(', ')}`
        );
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_uptime_check_list_configs]
}

function listUptimeCheckIps() {
  // [START monitoring_uptime_check_list_ips]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.UptimeCheckServiceClient();

  // List uptime check IPs
  client
    .listUptimeCheckIps()
    .then(results => {
      const uptimeCheckIps = results[0];
      uptimeCheckIps.forEach(uptimeCheckIp => {
        console.log(
          uptimeCheckIp.region,
          uptimeCheckIp.location,
          uptimeCheckIp.ipAddress
        );
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_uptime_check_list_ips]
}

function getUptimeCheckConfig(projectId, uptimeCheckConfigId) {
  // [START monitoring_uptime_check_get]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.UptimeCheckServiceClient();

  /**
   * TODO(developer): Uncomment and edit the following lines of code.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const uptimeCheckConfigId = 'YOUR_UPTIME_CHECK_CONFIG_ID';

  const request = {
    // i.e. name: 'projects/my-project-id/uptimeCheckConfigs/My-Uptime-Check
    name: client.uptimeCheckConfigPath(projectId, uptimeCheckConfigId),
  };

  console.log(`Retrieving ${request.name}`);

  // Retrieves an uptime check config
  client
    .getUptimeCheckConfig(request)
    .then(results => {
      const uptimeCheckConfig = results[0];

      console.log(`ID: ${uptimeCheckConfig.name}`);
      console.log(`Display Name: ${uptimeCheckConfig.displayName}`);
      console.log(`Resource: %j`, uptimeCheckConfig.monitoredResource);
      console.log(`Period: %j`, uptimeCheckConfig.period);
      console.log(`Timeout: %j`, uptimeCheckConfig.timeout);
      console.log(`Check type: ${uptimeCheckConfig.check_request_type}`);
      console.log(
        `Check: %j`,
        uptimeCheckConfig.httpCheck || uptimeCheckConfig.tcpCheck
      );
      console.log(
        `Content matchers: ${uptimeCheckConfig.contentMatchers
          .map(matcher => matcher.content)
          .join(', ')}`
      );
      console.log(`Regions: ${uptimeCheckConfig.selectedRegions.join(', ')}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_uptime_check_get]
}

function deleteUptimeCheckConfig(projectId, uptimeCheckConfigId) {
  // [START monitoring_uptime_check_delete]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.UptimeCheckServiceClient();

  /**
   * TODO(developer): Uncomment and edit the following lines of code.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const uptimeCheckConfigId = 'YOUR_UPTIME_CHECK_CONFIG_ID';

  const request = {
    // i.e. name: 'projects/my-project-id/uptimeCheckConfigs/My-Uptime-Check
    name: client.uptimeCheckConfigPath(projectId, uptimeCheckConfigId),
  };

  console.log(`Deleting ${request.name}`);

  // Delete an uptime check config
  client
    .deleteUptimeCheckConfig(request)
    .then(() => {
      console.log(`${request.name} deleted.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END monitoring_uptime_check_delete]
}

require(`yargs`)
  .demand(1)
  .command(
    `create <gceInstanceId> [projectId]`,
    `Creates an uptime check config.`,
    {},
    opts => createUptimeCheckConfig(opts.projectId, '' + opts.gceInstanceId)
  )
  .command(`list [projectId]`, `Lists uptime check configs.`, {}, opts =>
    listUptimeCheckConfigs(opts.projectId)
  )
  .command(`list-ips`, `Lists uptime check config IPs.`, {}, () =>
    listUptimeCheckIps()
  )
  .command(
    `get <uptimeCheckConfigId> [projectId]`,
    `Gets an uptime check config.`,
    {},
    opts => getUptimeCheckConfig(opts.projectId, opts.uptimeCheckConfigId)
  )
  .command(
    `delete <uptimeCheckConfigId> [projectId]`,
    `Deletes an uptime check config.`,
    {},
    opts => deleteUptimeCheckConfig(opts.projectId, opts.uptimeCheckConfigId)
  )
  .options({
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT,
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example(
    `node $0 create my-instance`,
    'Create an uptime check for a "my-instance" GCE instance.'
  )
  .example(`node $0 list`, 'List all uptime check configs.')
  .example(
    `node $0 list "resource.type = gce_instance AND resource.label.instance_id = mongodb"`,
    'List all uptime check configs for a specific GCE instance.'
  )
  .example(`node $0 list-ips`)
  .example(`node $0 get My-Uptime-Check`)
  .example(`node $0 delete My-Uptime-Check`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/monitoring/uptime-checks/`
  )
  .help()
  .strict().argv;
