// Copyright 2023 Google LLC
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

// sample-metadata:
//  title: Get an inspection job
//  description: Get DLP inspection job using job name.
//  usage: node getJob.js jobName
function main(jobName) {
  // [START dlp_get_job]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // Job name to look for
  // const jobName = 'your-job-name';

  async function getJob() {
    // Construct request for finding job using job name.
    const request = {
      name: jobName,
    };

    // Send the request and receive response from the service
    const [job] = await dlp.getDlpJob(request);

    // Print results.
    console.log(`Job ${job.name} status: ${job.state}`);
  }

  getJob();
  // [END dlp_get_job]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
