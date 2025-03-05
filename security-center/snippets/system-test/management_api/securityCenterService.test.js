/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {assert} = require('chai');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});
const {describe, it} = require('mocha');

// TODO(developer): Update the organization ID and service name to match your testing environment
const organizationId = '1081635000895';
// Replace service with one of the valid values:
// container-threat-detection, event-threat-detection, security-health-analytics,
// vm-threat-detection, web-security-scanner
const service = 'event_threat_detection';

describe('Security Center Service', async () => {
  const data = {
    orgId: organizationId,
    service: service,
  };

  it('should get the security center service', done => {
    const output = exec(
      `node management_api/getSecurityCenterService.js ${data.orgId} ${data.service}`
    );
    assert(output.includes(data.orgId));
    assert(output.includes(data.service));
    assert.match(output, /Retrieved SecurityCenterService/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('should list the security center services', done => {
    const output = exec(
      `node management_api/listSecurityCenterServices.js ${data.orgId}`
    );
    assert(output.includes(data.orgId));
    assert(output.includes(data.service.toUpperCase()));
    assert.match(output, /Security Center Service Name/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('should update the security center service', done => {
    const output = exec(
      `node management_api/updateSecurityCenterService.js ${data.orgId} ${data.service}`
    );
    assert(output.includes(data.orgId));
    assert(output.includes(data.service));
    assert.match(output, /Updated SecurityCenterService/);
    assert.notMatch(output, /undefined/);
    done();
  });
});
