/**
 * Copyright 2020, Google, Inc.
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

function main(projectId = process.env.GOOGLE_CLOUD_PROJECT, location) {
  // [START transcoder_list_job_templates]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';

  // Imports the Transcoder library
  const {TranscoderServiceClient} = require('@google-cloud/video-transcoder');

  // Instantiates a client
  const transcoderServiceClient = new TranscoderServiceClient();

  async function listJobTemplates() {
    const [jobTemplates] = await transcoderServiceClient.listJobTemplates({
      parent: transcoderServiceClient.locationPath(projectId, location),
    });
    console.info('Job templates:');
    for (const jobTemplate of jobTemplates) {
      console.info(jobTemplate.name);
    }
  }

  listJobTemplates();
  // [END transcoder_list_job_templates]
}

// node listJobTemplates.js <projectId> <location>
main(...process.argv.slice(2));
