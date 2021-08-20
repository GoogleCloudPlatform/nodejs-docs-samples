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

function main(projectId, location, templateId) {
  // [START transcoder_get_job_template]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // templateId = 'my-job-template';

  // Imports the Transcoder library
  const {TranscoderServiceClient} =
    require('@google-cloud/video-transcoder').v1;

  // Instantiates a client
  const transcoderServiceClient = new TranscoderServiceClient();

  async function getJobTemplate() {
    // Construct request
    const request = {
      name: transcoderServiceClient.jobTemplatePath(
        projectId,
        location,
        templateId
      ),
    };
    const [jobTemplate] = await transcoderServiceClient.getJobTemplate(request);
    console.log(`Job template: ${jobTemplate.name}`);
  }

  getJobTemplate();
  // [END transcoder_get_job_template]
}

// node getJobTemplate.js <projectId> <location> <templateId>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
