// Copyright 2021 Google LLC
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

const assert = require('assert');
const supertest = require('supertest');
const path = require('path');
const puppeteer = require('puppeteer');
const server = require(path.join(path.dirname(__dirname), 'app.js'));

describe('Unit Tests', () => {
  it('should be listening', async () => {
    await supertest(server).get('/').expect(200);
  });
})

describe('Integration Tests', () => {
  let browser, browserPage;
  
  before(async () => {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {});
  
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    browserPage = await browser.newPage();
  });
  
  after(async () => {
    await browser.close();
    await server.close();
  });

  it('should process chat message', async () => {
    await browserPage.goto('http://localhost:8080');
    // Log in
    await browserPage.evaluate(() => {
      document.querySelector('#name').value = 'Sundar';
      document.querySelector('#room').value = 'Google';
      document.querySelector('.signin').click();
    });
    
    // Send message
    await browserPage.evaluate(() => {
      document.querySelector('#msg').value = 'Welcome!';
      document.querySelector('.send').click();
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Confirm message
    const list = await browserPage.$('#messages li');
    const itemText = await browserPage.evaluate(el => el.textContent, list);
    assert.strictEqual(itemText.trim(), 'Sundar: Welcome!');

    // Confirm room
    const room = await browserPage.$('#chatroom h1');
    const roomText = await browserPage.evaluate(el => el.textContent, room);
    assert.strictEqual(roomText, 'Google');

  });
});