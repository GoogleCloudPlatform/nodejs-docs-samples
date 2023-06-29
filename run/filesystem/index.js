// Copyright 2023 Google LLC
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

const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Rate limit exceeded',
  headers: true,
});
const mntDir = process.env.MNT_DIR || '/mnt/nfs/filestore';
const filePrefix = process.env.FILENAME || 'test';

app.use(limit);
app.use(mntDir, express.static(mntDir));

app.get(mntDir, async (req, res) => {
  await writeFile(mntDir);
  let html =
    '<html><body>A new file is generated each time this page is reloaded.<p>Files created on filesystem:<p>';
  fs.readdirSync(mntDir).forEach(filename => {
    html += `<a href="${req.protocol}://${req.get(
      'host'
    )}${mntDir}/${filename}">${filename}</a><br>`;
  });
  html += '</body></html>';
  res.send(html);
});
app.get('/', (req, res) => {
  res.redirect(mntDir);
});
app.all('*', (req, res) => {
  res.redirect(mntDir);
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

async function writeFile(path) {
  let date = new Date();
  date = date.toString().split(' ').slice(0, 5).join('-');
  const filename = `${filePrefix}-${date}.txt`;
  const contents = `This test file was created on ${date}\n`;

  fs.writeFile(`${path}/${filename}`, contents, err => {
    if (err) {
      console.error(`could not write to file system:\n${err}`);
    }
  });
}

module.exports = app;
