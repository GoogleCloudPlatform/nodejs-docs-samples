const {createAssessment} = require('../recaptcha/createAssessment');

const assessmentController = async (req, res) => {
  try {
    const assessmentData = await createAssessment(
      process.env.GOOGLE_CLOUD_PROJECT,
      req.body.sitekey,
      req.body.token,
      req.body.action
    );

    res.json({
      error: null,
      data: assessmentData,
    });
  } catch (e) {
    res.json({
      error: e.toString(),
      data: null,
    });
  }
};

module.exports = {
  assessmentController,
};
