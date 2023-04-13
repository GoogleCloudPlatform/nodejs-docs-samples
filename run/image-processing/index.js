// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START cloudrun_imageproc_server]
// [START run_imageproc_server]
const app = require('./app.js');
const PORT = parseInt(parseInt(process.env.PORT)) || 8080;

app.listen(PORT, () =>
  console.log(`nodejs-image-processing listening on port ${PORT}`)
);
// [END run_imageproc_server]
// [END cloudrun_imageproc_server]
