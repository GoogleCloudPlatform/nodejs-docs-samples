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
/**
 * Express webapp that generates files to a mounted NFS  when deployed to Cloud Run.
 *
 * See https://cloud.google.com/run/docs/tutorials/network-filesystems-filestore before running the code snippet.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs/promises');
const app = express();
const mntDir = process.env.MNT_DIR || '/mnt/nfs/filestore';
const port = parseInt(process.env.PORT) || 8080;
const limit = rateLimit({
  // Use of rate limit to fullfill CodeQL rule js/missing-rate-limiting
  // HTTP request handlers should not perform expensive operations such as
  // accessing the file system. Setting rate limit to maximum 100 requests
  // per 15 minute window.
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Rate limit exceeded',
  headers: true,
});

app.use(limit);
app.use(mntDir, express.static(mntDir));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.get(mntDir, async (req, res) => {
  // Have all requests to mount directory generate a new file on the filesystem.
  try {
    writeFile(mntDir);
    const html = await generateIndex(mntDir);
    // Respond with html with list of files on the filesystem.
    res.send(html);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        'Something went wrong when writing to the filesystem. Refresh the page to try again.'
      );
  }
});

app.all('*', (req, res) => {
  // Redirect all requests to the mount directory
  res.redirect(mntDir);
});

const writeFile = async (path, filePrefix = 'test') => {
  // Write a test file to the provided path.
  const date = new Date();
  const formattedDate = date.toString().split(' ').slice(0, 5).join('-');
  const filename = `${filePrefix}-${formattedDate}.txt`;
  const contents = `This test file was created on ${formattedDate}.\n`;

  try {
    const newFile = fs.writeFile(`${path}/${filename}`, contents);
    await newFile;
  } catch (error) {
    console.error(error);
  }
};

const generateIndex = async mntDir => {
  // Return html for page with a list of files on the mounted filesystem.
  try {
    const header =
      '<html><body>A new file is generated each time this page is reloaded.<p>Files created on filesystem:<p>';
    const footer = '</body></html>';
    // Get list of files on mounted filesystem.
    const existingFiles = await fs.readdir(mntDir);
    // Insert each file into html content
    const htmlBody = existingFiles.map(fileName => {
      const sanitized = encodeURIComponent(fileName);
      return `<a href="${mntDir}/${sanitized}">${decodeURIComponent(
        sanitized
      )}</a><br>`;
    });
    return header + htmlBody.join(' ') + footer;
  } catch (error) {
    console.log(error);
  }
};

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Exiting.');
});

module.exports = app;
