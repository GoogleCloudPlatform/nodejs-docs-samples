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

const THRESHHOLD_SCORE = 0.50;

async function createAssessment(
  projectId,
  recaptchSiteKey,
  token,
  recaptchaAction
) {
  const client = new RecaptchaEnterpriseServiceClient();

  const [response] = await client.createAssessment({
    parent: `projects/${projectId}`,
    assessment: {
      event: {
        siteKey: recaptchSiteKey,
        token,
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

  // Get the risk score and the reason(s)
  // For more information on interpreting the assessment,
  // see https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
  for (const reason of response.riskAnalysis.reasons) {
    console.log(reason);
  }

  console.log(
    `The reCAPTCHA score for this token is: ${response.riskAnalysis.score}`
  );

  let verdict = 'Human';

  if (response.riskAnalysis.score < THRESHHOLD_SCORE) {
    verdict = 'Not a human';
  }

  return {
    score: response.riskAnalysis.score,
    verdict,
  };
}

module.exports = {
  createAssessment,
};
