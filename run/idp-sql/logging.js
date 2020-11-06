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

// Create a Winston logger that streams to Stackdriver Logging.
const {createLogger, transports, format} = require('winston');

// Add severity label for Stackdriver log parsing
const addSeverity = format(info => {
  info.severity = info.level;
  return info;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    addSeverity(),
    format.timestamp(),
    format.json()
    // format.prettyPrint(), // Uncomment for local debugging
  ),
  transports: [new transports.Console()],
});

module.exports = {
  logger,
};
