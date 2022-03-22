// Copyright 2022 Google LLC
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

'use strict';

const compute = require('@google-cloud/compute');

const {describe, it} = require('mocha');
const cp = require('child_process');
const {assert} = require('chai');

const {generateTestId, getStaleVMInstances, deleteInstance} = require('./util');

const instancesClient = new compute.InstancesClient();
const firewallsClient = new compute.FirewallsClient();
const routesClient = new compute.RoutesClient();
const globalOperationsClient = new compute.GlobalOperationsClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const deleteFirewallRule = async (projectId, firewallRule) => {
  const [response] = await firewallsClient.delete({
    project: projectId,
    firewall: firewallRule,
  });
  let operation = response.latestResponse;

  // Wait for the delete operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await globalOperationsClient.wait({
      operation: operation.name,
      project: projectId,
    });
  }
};

const deleteRoute = async (projectId, routeName) => {
  const [response] = await routesClient.delete({
    project: projectId,
    route: routeName,
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.GlobalOperationsClient();

  // Wait for the delete operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
    });
  }
};

describe('creating managing windows instances tests', () => {
  const instanceName = generateTestId();
  const firewallRuleName = generateTestId();
  const networkName = 'global/networks/default-compute';
  const subnetworkName = 'regions/europe-central2/subnetworks/default-compute';
  const routeName = generateTestId();
  const zone = 'europe-central2-b';
  const machineType = 'n1-standard-1';
  const sourceImageFamily = 'windows-2012-r2';

  before(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should create windows server instance with external IP', async () => {
    const projectId = await instancesClient.getProjectId();

    const output = execSync(
      `node instances/windows/creating-managing-windows-instances/createWindowsServerInstanceExternalIP ${projectId} ${zone} ${instanceName}`
    );
    assert.match(output, /Instance created./);

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });

  it('should create windows server instance with internal IP and firewall rule', async () => {
    const projectId = await instancesClient.getProjectId();

    const output = execSync(
      `node instances/windows/creating-managing-windows-instances/createWindowsServerInstanceInternalIP ${projectId} ${zone} ${instanceName} ${machineType} ${sourceImageFamily} ${networkName} ${subnetworkName}`
    );

    assert.match(output, /Instance created./);

    const outputFirewall = execSync(
      `node instances/windows/creating-managing-windows-instances/createFirewallRuleForWindowsActivationHost ${projectId} ${firewallRuleName} ${networkName}`
    );

    assert.match(outputFirewall, /Firewall rule created./);

    const outputRoute = execSync(
      `node instances/windows/creating-managing-windows-instances/createRouteToWindowsActivationHost ${projectId} ${routeName} ${networkName}`
    );

    assert.match(outputRoute, /Route created./);

    await deleteRoute(projectId, routeName);
    await deleteFirewallRule(projectId, firewallRuleName);
    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
