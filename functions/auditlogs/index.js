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

'use strict';

exports.processFirewallAuditLogs = (event) => {
  const msg = JSON.parse(Buffer.from(event.data.data, 'base64').toString());
  const logEntry = msg.protoPayload;
  if (logEntry &&
      logEntry.request &&
      logEntry.methodName === 'v1.compute.firewalls.insert') {
    let cancelFirewall = false;
    const allowed = logEntry.request.alloweds;
    if (allowed) {
      for (let key in allowed) {
        const entry = allowed[key];
        for (let port in entry.ports) {
          if (parseInt(entry.ports[port], 10) !== 22) {
            cancelFirewall = true;
            break;
          }
        }
      }
    }
    if (cancelFirewall) {
      const resourceArray = logEntry.resourceName.split('/');
      const resourceName = resourceArray[resourceArray.length - 1];
      const compute = require('@google-cloud/compute')();
      return compute.firewall(resourceName).delete();
    }
  }
  return true;
};
