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

const mntDir = process.env.MNT_DIR || '/mnt/nfs/filestore'
const filename = process.env.FILENAME
const port = parseInt(process.env.PORT) || 8080;

app.get(`${mntDir}\*`, (req, res) => {
    res.send(`hello world`);
});

app.all('*', (req, res) => {
    res.redirect(`${mntDir}`);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = app;
