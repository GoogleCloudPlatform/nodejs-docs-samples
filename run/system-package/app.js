// Copyright 2019 Google LLC
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

const {execSync} = require('child_process');
const fs = require('fs');

const express = require('express');
const app = express();

// Verify the the dot utility is available at startup
// instead of waiting for a first request.
fs.accessSync('/usr/bin/dot', fs.constants.X_OK);

// [START cloudrun_system_package_handler]
// [START run_system_package_handler]
app.get('/diagram.png', (req, res) => {
  try {
    const image = createDiagram(req.query.dot);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', image.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(image);
  } catch (err) {
    console.error(`error: ${err.message}`);
    const errDetails = (err.stderr || err.message).toString();
    if (errDetails.includes('syntax')) {
      res.status(400).send(`Bad Request: ${err.message}`);
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
});
// [END run_system_package_handler]
// [END cloudrun_system_package_handler]

// [START cloudrun_system_package_exec]
// [START run_system_package_exec]
// Generate a diagram based on a graphviz DOT diagram description.
const createDiagram = dot => {
  if (!dot) {
    throw new Error('syntax: no graphviz definition provided');
  }

  // Adds a watermark to the dot graphic.
  const dotFlags = [
    '-Glabel="Made on Cloud Run"',
    '-Gfontsize=10',
    '-Glabeljust=right',
    '-Glabelloc=bottom',
    '-Gfontcolor=gray',
  ].join(' ');

  const image = execSync(`/usr/bin/dot ${dotFlags} -Tpng`, {
    input: dot,
  });
  return image;
};
// [END run_system_package_exec]
// [END cloudrun_system_package_exec]

module.exports = app;
