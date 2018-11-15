/*
Copyright 2018 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
'use strict';

// [START full_sample]
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

let browser;

app.use(async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.send(
      'Please provide URL as GET parameter, for example: <a href="/?url=https://example.com">?url=https://example.com</a>'
    );
  }

  if (!browser) {
    // [START browser]
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    // [END browser]
  }

  let page = await browser.newPage();
  await page.goto(url);
  const imageBuffer = await page.screenshot();

  res.set('Content-Type', 'image/png');
  res.send(imageBuffer);
});

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) {
    return console.error(err);
  }
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});
// [END full_sample]

module.exports = app;
