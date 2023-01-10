const signupController = (req, res) => {
  const context = {
    project_id: process.env.GOOGLE_CLOUD_PROJECT,
    checkbox_site_key: process.env.CHECKBOX_SITE_KEY,
  };

  res.render('signup', context);
};

module.exports = {
  signupController,
};
