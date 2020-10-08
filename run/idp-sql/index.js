// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const app = require('./app');
const pkg = require('./package.json');
const { logger } = require('./logging');
const { createTable } = require('./cloud-sql');
const { GoogleAuth } = require('google-auth-library');
const PORT = process.env.PORT || 8080;

const startServer = () => {
  app.listen(PORT, () => logger.info(`${pkg.name} listening on port ${PORT}`));
};

const main = async () => {
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    try {
      const auth = new GoogleAuth();
      const project = await auth.getProjectId();
      process.env.GOOGLE_CLOUD_PROJECT = project;
      await createTable(); // Create postgreSQL table if not found
      startServer();
    } catch (err) {
      logger.error(`Error while identifying project from metadata server: ${err}`);
    }
  } else {
    startServer();
  }
};

main();
