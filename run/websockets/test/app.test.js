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
});