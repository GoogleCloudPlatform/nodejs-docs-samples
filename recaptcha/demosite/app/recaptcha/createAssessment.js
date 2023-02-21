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

const SAMPLE_THRESHOLD_SCORE = 0.5;

/**
 * Create an assessment to analyze the risk of a UI action.
 * @param projectId: GCloud Project ID
 * @param recaptchaSiteKey: Site key obtained by registering a domain/app to use recaptcha services.
 * @param token: The token obtained from the client on passing the recaptchaSiteKey.
 * @param recaptchaAction: Action name corresponding to the token.
 * @return {Promise<{score: *, verdict: string}>}
 */
async function createAssessment(
  projectId,
  recaptchaSiteKey,
  token,
  recaptchaAction
) {
  // <!-- ATTENTION: reCAPTCHA Example (Server Part 2/2) Starts -->
  const client = new RecaptchaEnterpriseServiceClient();

  // Build the assessment request.
  const [response] = await client.createAssessment({
    parent: `projects/${projectId}`,
    assessment: {
      event: {
        siteKey: recaptchaSiteKey,
        token: token,
      },
    },
  });

  // Check if the token is valid.
  if (!response.tokenProperties || !response.tokenProperties.valid) {
    throw new Error(
      `The Create Assessment call failed because the token was invalid for the following reasons: ${response.tokenProperties.invalidReason}`
    );
  }

  // Check if the expected action was executed.
  if (response.tokenProperties.action !== recaptchaAction) {
    throw new Error(
      'The action attribute in your reCAPTCHA tag does not match the action you are expecting to score. Please check your action attribute !'
    );
  }
  // <!-- ATTENTION: reCAPTCHA Example (Server Part 2/2) Ends -->

  // Return the risk score.
  let verdict = 'Not Bad';
  if (response.riskAnalysis.score < SAMPLE_THRESHOLD_SCORE) {
    verdict = 'Bad';
  }
  return {
    score: response.riskAnalysis.score.toFixed(1),
    verdict,
  };
}

module.exports = {
  createAssessment,
};
