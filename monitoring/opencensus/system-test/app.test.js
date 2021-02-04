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

const expect = require('chai').expect;
const request = require('request');

describe('Web server', () => {
  describe('Returns responses', () => {
    const url = 'http://localhost:8080';
    it('returns status 200 most of the time', done => {
      // send 5 requests, most of them should be 200s
      let successCounter = 0;
      let i;
      for (i = 0; i < 5; i++) {
        request(url, (error, response) => {
          if (response.statusCode === 200) {
            successCounter++;
          }
        });
      }
      done();
      expect(successCounter).to.be.above(2);
    });
  });
});
