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
const app = express();
const fs = require('fs');

const mntDir = process.env.MNT_DIR || '/mnt/nfs/filestore'
const filePrefix = process.env.FILENAME || 'test'
const port = parseInt(process.env.PORT) || 8080;

app.get(`${mntDir}`, async (req, res) => {
    await writeFile(mntDir)
    const files = fs.readdirSync(mntDir);
    let html = '<html><body>\nFiles created on filesystem:\n<br>'
    files.forEach(file => {
        html += `<a href="${req.protocol}://${req.get('host')}${req.originalUrl}/${file}">${file}</a><br>`
    })
    html += `</body></html>`
    res.send(html);
});

app.get(`${mntDir}/*`, (req, res) => {
    fs.readFile(req.originalUrl, 'utf-8', (err, data) => {
        let html = '<html><body>\n';
        html += `<a href="${mntDir}">${mntDir}</a><br><br/>\n`
        html += `${data}\n</body></html>`
        res.send(html)
    })
});

app.all('*', (req, res) => {
    res.redirect(`${mntDir}`);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

async function writeFile(path) {
    let date = new Date();
    date = date.toString().split(' ').join('-')
    const filename = `${filePrefix}-${date}.txt`
    const contents = `This test file was created on ${date}\n`

    fs.writeFile(`${path}/${filename}`, contents, err => {
        if (err) {
            console.error(`could not write to file system:\n${err}`);
        };
    });
}

module.exports = app;