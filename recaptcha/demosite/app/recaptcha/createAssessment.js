const {RecaptchaEnterpriseServiceClient} =
  require('@google-cloud/recaptcha-enterprise').v1;

const THRESHHOLD_SCORE = 0.5;

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
