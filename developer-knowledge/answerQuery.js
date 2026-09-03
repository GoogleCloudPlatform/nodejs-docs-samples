// Copyright 2026 Google LLC
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

// [START developerknowledge_answer_query]
const {DeveloperKnowledgeClient} = require('@google/developer-knowledge');

/**
 * Answers a developer question grounded in Google developer documentation.
 *
 * @param {string} query The technical question to answer.
 */
async function answerQuery(
  query = 'How do I create a Google Cloud Storage bucket?'
) {
  const client = new DeveloperKnowledgeClient();

  const request = {
    query,
  };

  const [response] = await client.answerQuery(request);

  console.log(`Answer:\n${response.answer.answerText}\n`);
  const citationsCount = response.answer.citations
    ? response.answer.citations.length
    : 0;
  const referencesCount = response.answer.references
    ? response.answer.references.length
    : 0;
  console.log(`Citations count: ${citationsCount}`);
  console.log(`References count: ${referencesCount}`);

  return response;
}
// [END developerknowledge_answer_query]

module.exports = {answerQuery};

if (require.main === module) {
  answerQuery(...process.argv.slice(2)).catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}
