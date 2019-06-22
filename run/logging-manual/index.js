// Copyright 2019 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

const app = require('./app');
const metadata = require('./metadata');
const PORT = process.env.PORT || 8080;
const SERVICE = require('./package').name;

const startServer = () => {
  app.listen(PORT, () => console.log(`${SERVICE} listening on port ${PORT}`));
};

if (!process.env.GOOGLE_CLOUD_PROJECT) {
  metadata
    .getProjectId()
    .then(project => {
      process.env.GOOGLE_CLOUD_PROJECT = project;
      startServer();
    })
    .catch(error => {
      console.error(`error: Identify project from metadata server: ${error}`);
    });
} else {
  startServer();
}
