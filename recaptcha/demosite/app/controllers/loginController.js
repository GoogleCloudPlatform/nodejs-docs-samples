const loginController = (req, res) => {
  const context = {
    project_id: process.env.GOOGLE_CLOUD_PROJECT,
    site_key: process.env.SITE_KEY,
  };

  res.render('login', context);
};

module.exports = {
  loginController,
};
