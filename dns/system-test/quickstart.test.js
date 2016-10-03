/**
 * Copyright 2016, Google, Inc.
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

const proxyquire = require(`proxyquire`).noPreserveCache();
const dns = proxyquire(`@google-cloud/dns`, {})();

const uuid = require(`uuid`);
const zoneName = `test-${uuid().substring(0, 13)}`;

describe(`dns:quickstart`, () => {
  let dnsMock, DNSMock;

  before((done) => {
    dns.createZone(zoneName, {
      dnsName: `${process.env.GCLOUD_PROJECT}.appspot.com.`
    }, done);
  });

  after((done) => {
    dns.zone(zoneName).delete(() => {
      // Ignore error
      done();
    });
  });

  it(`should list zones`, (done) => {
    dnsMock = {
      getZones: (_callback) => {
        assert.equal(typeof _callback, 'function');

        // Listing is eventually consistent, give the indexes time to update
        setTimeout(() => {
          dns.getZones((err, zones) => {
            _callback(err, zones);
            assert.ifError(err);
            assert.equal(Array.isArray(zones), true);
            assert.equal(console.log.called, true);
            assert.deepEqual(console.log.firstCall.args, [`Zones:`]);
            zones.forEach((zone, i) => {
              assert.deepEqual(console.log.getCall(i + 1).args, [zone.name]);
            });
            done();
          });
        }, 5000);
      }
    };
    DNSMock = sinon.stub().returns(dnsMock);

    proxyquire(`../quickstart`, {
      '@google-cloud/dns': DNSMock
    });
  });
});
