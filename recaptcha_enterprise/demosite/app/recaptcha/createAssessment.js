// Copyright 2023 Google LLC
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

const {RecaptchaEnterpriseServiceClient} =
  require('@google-cloud/recaptcha-enterprise').v1;

/**
 * Create an assessment to analyze the risk of a UI action.
 * @param projectId: GCloud Project ID
 * @param recaptchaSiteKey: Site key obtained by registering a domain/app to use recaptcha services.
 * @param token: The token obtained from the client on passing the recaptchaSiteKey.
 * @param expectedAction: The expected action for this type of event.
 * @returns Assessment
 */
async function createAssessment(
  projectId,
  recaptchaSiteKey,
  token,
  expectedAction
) {
  // <!-- ATTENTION: reCAPTCHA Example (Server Part 2/2) Starts -->
  const client = new RecaptchaEnterpriseServiceClient();

  // Build the assessment request.
  const [response] = await client.createAssessment({
    parent: `projects/${projectId}`,
    assessment: {
      // Set the properties of the event to be tracked.
      event: {
        siteKey: recaptchaSiteKey,
        token: token,
        expectedAction: expectedAction,
      },
    },
  });
  // <!-- ATTENTION: reCAPTCHA Example (Server Part 2/2) Ends -->
  return response;
}

module.exports = {
  createAssessment,
};
