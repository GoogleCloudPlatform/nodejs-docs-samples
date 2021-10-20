// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const cp = require('child_process');
const {v4} = require('uuid');
const {describe, it, before, after} = require('mocha');

const talent = require('@google-cloud/talent').v4;
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

/**
 * For eventually consistent APIs, retry the test after a few seconds, up to 3 times.
 * @param {function} testFunction the test function to retry.
 * @returns {function}
 */
function eventually(testFunction) {
  return async () => {
    let delayMs = 2000;
    for (let i = 0; i < 2; ++i) {
      try {
        return await testFunction();
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }
    return await testFunction();
  };
}

describe('Talent Solution Jobs API v4 samples', () => {
  const projectId = process.env.GCLOUD_PROJECT;
  const tenantService = new talent.TenantServiceClient();
  const companyService = new talent.CompanyServiceClient();
  const jobService = new talent.JobServiceClient();

  let tenant;
  let company;
  let job;

  let tenantId;
  let companyId;
  let jobId;

  before(async () => {
    const formattedParent = tenantService.projectPath(projectId);

    [tenant] = await tenantService.createTenant({
      parent: formattedParent,
      tenant: {
        externalId: `${Date.now()}-${v4()}`,
      },
    });
    tenantId = tenant.name.split('/').slice(-1)[0];
    console.log(`created tenant: ${tenant.name}`);

    [company] = await companyService.createCompany({
      parent: tenant.name,
      company: {
        displayName: 'Google',
        externalId: `${Date.now()}-${v4()}`,
      },
    });
    console.log(`created company: ${company.name}`);
    companyId = company.name.split('/').slice(-1)[0];

    const applicationInfo = {
      uris: ['http://test.url'],
    };

    const addressOne = '1600 Amphitheatre Parkway, Mountain View, CA 94043';
    const addressTwo = '111 8th Avenue, New York, NY 10011';

    const jobRequest = {
      company: company.name,
      requisitionId: v4(),
      title: 'Software engineer',
      description: 'Nodejs engineer',
      applicationInfo: applicationInfo,
      addresses: [addressOne, addressTwo],
      languageCode: 'en-US',
    };

    [job] = await jobService.createJob({
      parent: tenant.name,
      job: jobRequest,
    });
    console.log(`created job: ${job.name}`);
    jobId = job.name.split('/').slice(-1)[0];
  });

  after(async () => {
    await jobService.deleteJob({name: job.name});
    await companyService.deleteCompany({name: company.name});
    await tenantService.deleteTenant({name: tenant.name});
  });

  it('Gets a job', async () => {
    console.log(
      `node snippet/job_search_get_job.js --project_id=${projectId} --tenant_id=${tenantId} --job_id=${jobId}`
    );
    const output = execSync(
      `node snippet/job_search_get_job.js --project_id=${projectId} --tenant_id=${tenantId} --job_id=${jobId}`
    );
    assert.match(output, new RegExp('Job name'));
  });
  it('Gets a company', async () => {
    console.log(
      `node snippet/job_search_get_company.js --project_id=${projectId} --tenant_id=${tenantId} --company_id=${companyId}`
    );
    const output = execSync(
      `node snippet/job_search_get_company.js --project_id=${projectId} --tenant_id=${tenantId} --company_id=${companyId}`
    );
    assert.match(output, new RegExp('Company name'));
  });

  it('Gets a tenant', async () => {
    console.log(
      `node snippet/job_search_get_tenant.js --project_id=${projectId} --tenant_id=${tenantId}`
    );
    const output = execSync(
      `node snippet/job_search_get_tenant.js --project_id=${projectId} --tenant_id=${tenantId}`
    );
    assert.match(output, new RegExp('Name'));
  });

  it(
    'Searches for a job with custom ranking search',
    eventually(async () => {
      console.log(
        `node snippet/job_search_custom_ranking_search.js --project_id=${projectId} --tenant_id=${tenantId}`
      );
      const output = execSync(
        `node snippet/job_search_custom_ranking_search.js --project_id=${projectId} --tenant_id=${tenantId}`
      );
      assert.match(output, new RegExp('Job summary'));
    })
  );

  it(
    'Searches for a job with histogram',
    eventually(async () => {
      console.log(
        `node snippet/job_search_histogram_search.js --project_id=${projectId} --tenant_id=${tenantId}`
      );
      const output = execSync(
        `node snippet/job_search_histogram_search.js --project_id=${projectId} --tenant_id=${tenantId}`
      );
      assert.match(output, new RegExp('Job summary'));
    })
  );
});
