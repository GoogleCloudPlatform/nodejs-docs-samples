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

// [START functions_firebase_firestore]
/**
 * Background Function triggered by a change to a Firestore document.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Object} context Cloud Functions event metadata.
 */
exports.helloFirestore = (event, context) => {
  const triggerResource = context.resource;

  console.log(`Function triggered by event on: ${triggerResource}`);
  console.log(`Event type: ${context.eventType}`);

  if (event.oldValue && Object.keys(event.oldValue).length) {
    console.log('\nOld value:');
    console.log(JSON.stringify(event.oldValue, null, 2));
  }

  if (event.value && Object.keys(event.value).length) {
    console.log('\nNew value:');
    console.log(JSON.stringify(event.value, null, 2));
  }
};
// [END functions_firebase_firestore]
