/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`use strict`;

async function main(operationFullId = 'YOUR_OPERATION_ID') {
  // [START automl_translation_get_operation_status]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const operationFullId = `Full name of an operation, eg. “Projects/<projectId>/locations/us-central1/operations/<operationId>

  // Get the latest state of a long-running operation.
  const [responses] = await client.operationsClient.getOperation(
    operationFullId
  );
  console.log(`Operation status: ${responses}`);
  // [END automl_translation_get_operation_status]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
