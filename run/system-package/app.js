// Copyright 2019 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

const {execSync} = require('child_process');
const fs = require('fs');

const express = require('express');
const app = express();

// Verify the the dot utility is available at startup
// instead of waiting for a first request.
fs.accessSync('/usr/bin/dot', fs.constants.X_OK);

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

// [START run_system_package_exec]

// Generate a diagram based on a graphviz DOT diagram description.
const createDiagram = (dot) => {
  if (!dot || (dot.constructor === Object && Object.keys(dot).length === 0)) {
    throw new Error('syntax: no graphviz definition provided');
  }

  const watermark = ` \
    -Glabel="Made on Cloud Run" \
    -Gfontsize=10 \
    -Glabeljust=right \
    -Glabelloc=bottom \
    -Gfontcolor=gray \
  `;
  const image = execSync(`/usr/bin/dot ${watermark} -Tpng`, {
    input: dot,
  });
  return image;
};

// [END run_system_package_exec]

module.exports = app;
