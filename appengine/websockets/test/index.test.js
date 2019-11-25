// Copyright 2018 Google LLC
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

/* eslint node/no-extraneous-require: "off" */

const assert = require('assert');
const puppeteer = require('puppeteer');
/* global document */

let browser, browserPage;

before(async () => {
  browser = await puppeteer.launch();
  browserPage = await browser.newPage();
});

after(async () => {
  await browser.close();
});

describe('appengine_websockets_app', () => {
  it('should process chat message', async () => {
    await browserPage.goto('http://localhost:8080');

    await browserPage.evaluate(() => {
      document.querySelector('input').value = 'test';
      document.querySelector('button').click();
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const itemText = await browserPage.evaluate(
      () => document.querySelector('li').textContent
    );

    assert.strictEqual(itemText, 'test');
  });
});
