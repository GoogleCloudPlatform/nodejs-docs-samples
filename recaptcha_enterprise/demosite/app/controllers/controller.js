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

// Sample threshold score for classification of bad / not bad action. The threshold score
// can be used to trigger secondary actions like MFA.
const SAMPLE_THRESHOLD_SCORE = 0.5;
const BAD = 'Bad';
const NOT_BAD = 'Not Bad';

// Parse config file and read available reCAPTCHA actions. All reCAPTCHA actions registered in the client
// should be mapped in the config file. This will be used to verify if the token obtained during assessment
// corresponds to the claimed action.
const propertiesReader = require('properties-reader');
const PROPERTIES = propertiesReader('config.properties');

const context = {
  project_id: process.env.GOOGLE_CLOUD_PROJECT,
  site_key: process.env.SITE_KEY,
};

// Return homepage template.
const home = (req, res) => {
  res.render('home', context);
};

// Return signup template.
const signup = (req, res) => {
  res.render('signup', context);
};

// Return login template.
const login = (req, res) => {
  res.render('login', context);
};

// Return store template.
const store = (req, res) => {
  res.render('store', context);
};

// Return comment template.
const comment = (req, res) => {
  res.render('comment', context);
};

// Return game template.
const game = (req, res) => {
  res.render('game', context);
};

const {createAssessment} = require('../recaptcha/createAssessment');
// On homepage load, execute reCAPTCHA Enterprise assessment and take action according to the score.
const onHomepageLoad = async (req, res) => {
  try {
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Starts -->
    const assessmentResponse = await createAssessment(
      context.project_id,
      context.site_key,
      req.body.recaptcha_cred.token
    );

    const verdict = function () {
      // Check if the token is valid, score is above threshold score and the action equals expected.
      if (
        assessmentResponse.tokenProperties.valid &&
        assessmentResponse.riskAnalysis.score > SAMPLE_THRESHOLD_SCORE &&
        assessmentResponse.tokenProperties.action ===
          PROPERTIES.get('recaptcha_action.home')
      ) {
        // Load the home page.
        // Business logic.
        // Classify the action as not bad.
        return NOT_BAD;
      } else {
        // If any of the above condition fails, trigger email/ phone verification flow.
        // Classify the action as bad.
        return BAD;
      }
    };
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Ends -->

    // Return the risk score.
    const result = {
      score: assessmentResponse.riskAnalysis.score.toFixed(1),
      verdict: verdict(),
    };
    res.json({
      data: result,
    });
  } catch (e) {
    res.json({
      data: {
        error_msg: e,
      },
    });
  }
};

// On signup button click, execute reCAPTCHA Enterprise assessment and take action according to the score.
const onSignup = async (req, res) => {
  try {
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Starts -->
    const assessmentResponse = await createAssessment(
      context.project_id,
      context.site_key,
      req.body.recaptcha_cred.token
    );

    const verdict = function () {
      // Check if the token is valid, score is above threshold score and the action equals expected.
      if (
        assessmentResponse.tokenProperties.valid &&
        assessmentResponse.riskAnalysis.score > SAMPLE_THRESHOLD_SCORE &&
        assessmentResponse.tokenProperties.action ===
          PROPERTIES.get('recaptcha_action.signup')
      ) {
        // Write new username and password to users database.
        // let username = req.body.recaptcha_cred.username
        // let password = req.body.recaptcha_cred.password
        // Business logic.
        // Classify the action as not bad.
        return NOT_BAD;
      } else {
        // If any of the above condition fails, trigger email/ phone verification flow.
        // Classify the action as bad.
        return BAD;
      }
    };
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Ends -->

    // Return the risk score.
    const result = {
      score: assessmentResponse.riskAnalysis.score.toFixed(1),
      verdict: verdict(),
    };
    res.json({
      data: result,
    });
  } catch (e) {
    res.json({
      data: {
        error_msg: e,
      },
    });
  }
};

// On login button click, execute reCAPTCHA Enterprise assessment and take action according to the score.
const onLogin = async (req, res) => {
  try {
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Starts -->
    const assessmentResponse = await createAssessment(
      context.project_id,
      context.site_key,
      req.body.recaptcha_cred.token
    );

    const verdict = function () {
      // Check if the token is valid, score is above threshold score and the action equals expected.
      if (
        assessmentResponse.tokenProperties.valid &&
        assessmentResponse.riskAnalysis.score > SAMPLE_THRESHOLD_SCORE &&
        assessmentResponse.tokenProperties.action ===
          PROPERTIES.get('recaptcha_action.login')
      ) {
        // Check if the login credentials exist and match.
        // let username = req.body.recaptcha_cred.username
        // let password = req.body.recaptcha_cred.password
        // Business logic.
        // Classify the action as not bad.
        return NOT_BAD;
      } else {
        // If any of the above condition fails, trigger email/ phone verification flow.
        // Classify the action as bad.
        return BAD;
      }
    };
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Ends -->

    // Return the risk score.
    const result = {
      score: assessmentResponse.riskAnalysis.score.toFixed(1),
      verdict: verdict(),
    };
    res.json({
      data: result,
    });
  } catch (e) {
    res.json({
      data: {
        error_msg: e,
      },
    });
  }
};

// On checkout button click in store page, execute reCAPTCHA Enterprise assessment and take action according to the score.
const onStoreCheckout = async (req, res) => {
  try {
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Starts -->
    const assessmentResponse = await createAssessment(
      context.project_id,
      context.site_key,
      req.body.recaptcha_cred.token
    );

    const verdict = function () {
      // Check if the token is valid, score is above threshold score and the action equals expected.
      if (
        assessmentResponse.tokenProperties.valid &&
        assessmentResponse.riskAnalysis.score > SAMPLE_THRESHOLD_SCORE &&
        assessmentResponse.tokenProperties.action ===
          PROPERTIES.get('recaptcha_action.store')
      ) {
        // Check if the cart contains items and proceed to checkout and payment.
        // let items = req.body.recaptcha_cred.items
        // Business logic.
        // Classify the action as not bad.
        return NOT_BAD;
      } else {
        // If any of the above condition fails, trigger email/ phone verification flow.
        // Classify the action as bad.
        return BAD;
      }
    };
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Ends -->

    // Return the risk score.
    const result = {
      score: assessmentResponse.riskAnalysis.score.toFixed(1),
      verdict: verdict(),
    };
    res.json({
      data: result,
    });
  } catch (e) {
    res.json({
      data: {
        error_msg: e,
      },
    });
  }
};

// On comment submit, execute reCAPTCHA Enterprise assessment and take action according to the score.
const onCommentSubmit = async (req, res) => {
  try {
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Starts -->
    const assessmentResponse = await createAssessment(
      context.project_id,
      context.site_key,
      req.body.recaptcha_cred.token
    );

    const verdict = function () {
      // Check if the token is valid, score is above threshold score and the action equals expected.
      if (
        assessmentResponse.tokenProperties.valid &&
        assessmentResponse.riskAnalysis.score > SAMPLE_THRESHOLD_SCORE &&
        assessmentResponse.tokenProperties.action ===
          PROPERTIES.get('recaptcha_action.comment')
      ) {
        // Check if comment has safe language and proceed to store in database.
        // let comment = req.body.recaptcha_cred.comment
        // Business logic.
        // Classify the action as not bad.
        return NOT_BAD;
      } else {
        // If any of the above condition fails, trigger email/ phone verification flow.
        // Classify the action as bad.
        return BAD;
      }
    };
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Ends -->

    // Return the risk score.
    const result = {
      score: assessmentResponse.riskAnalysis.score.toFixed(1),
      verdict: verdict(),
    };
    res.json({
      data: result,
    });
  } catch (e) {
    res.json({
      data: {
        error_msg: e,
      },
    });
  }
};

module.exports = {
  home,
  signup,
  login,
  store,
  comment,
  game,
  onHomepageLoad,
  onSignup,
  onLogin,
  onStoreCheckout,
  onCommentSubmit,
};
