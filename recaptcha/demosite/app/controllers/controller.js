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

const context = {
  project_id: process.env.GOOGLE_CLOUD_PROJECT,
  site_key: process.env.SITE_KEY,
};

const homeController = (req, res) => {
  res.render("home", context);
};

const storeController = (req, res) => {
  res.render("store", context);
};

const loginController = (req, res) => {
  res.render("login", context);
};

const commentController = (req, res) => {
  res.render("comment", context);
};

const signupController = (req, res) => {
  res.render("signup", context);
};

const gameController = (req, res) => {
  res.render("game", context);
};

const { createAssessment } = require("../recaptcha/createAssessment");
const assessmentController = async (req, res) => {
  try {
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Starts -->
    const assessmentData = await createAssessment(
      process.env.GOOGLE_CLOUD_PROJECT,
      context.site_key,
      req.body.recaptcha_cred.token,
      req.body.recaptcha_cred.action
    );
    // <!-- ATTENTION: reCAPTCHA Example (Server Part 1/2) Ends -->

    res.json({
      data: assessmentData,
      success: true,
    });
  } catch (e) {
    res.json({
      error_msg: e,
      success: false,
    });
  }
};

module.exports = {
  homeController,
  storeController,
  loginController,
  commentController,
  signupController,
  gameController,
  assessmentController,
};
