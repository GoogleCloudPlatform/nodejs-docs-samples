// Copyright 2022 Google LLC
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

const supertest = require('supertest');
const {getTestServer} = require('@google-cloud/functions-framework/testing');
require('../index');

describe('functions_hello_bigquery', () => {
  it('helloBigQuery: returns results', async () => {
    const results = [
      {word: 'the', word_count: 614},
      {word: 'I', word_count: 577},
      {word: 'and', word_count: 490},
      {word: 'to', word_count: 486},
      {word: 'a', word_count: 407},
    ];
    const server = getTestServer('helloBigQuery');
    await supertest(server).get('/').expect(200).expect(results);
  });
});
