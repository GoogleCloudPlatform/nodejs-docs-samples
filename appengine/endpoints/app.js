// Copyright 2017 Google LLC
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

'use strict';

const express = require('express');

const app = express();

// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

app.post('/echo', (req, res) => {
  res.status(200).json({message: req.body.message});
});

const authInfoHandler = (req, res) => {
  let authUser = {id: 'anonymous'};
  const encodedInfo = req.get('X-Endpoint-API-UserInfo');
  if (encodedInfo) {
    authUser = JSON.parse(Buffer.from(encodedInfo, 'base64'));
  }
  res.status(200).json(authUser);
};

app.get('/auth/info/googlejwt', authInfoHandler);
app.get('/auth/info/googleidtoken', authInfoHandler);

if (module === require.main) {
  const PORT = parseInt(process.env.PORT) || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
module.exports = app;
