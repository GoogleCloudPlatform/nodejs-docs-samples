// Copyright 2021 Google LLC
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

/* eslint-disable no-process-exit */

const {redisClient} = require('./redis');
const pkg = require('./package');
const server = require('./app');

const PORT = parseInt(process.env.PORT) || 8080;

// Start server
server.listen(PORT, () =>
  console.log(`${pkg.name}: listening on port ${PORT}`)
);

// Clean up resources on shutdown
process.on('SIGTERM', () => {
  console.log(`${pkg.name}: received SIGTERM`);
  redisClient.quit();
  process.exit(0);
});

module.exports = server;
