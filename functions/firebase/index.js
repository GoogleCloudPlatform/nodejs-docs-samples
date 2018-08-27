/**
 * Copyright 2018, Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START functions_firebase_rtdb]
/**
 * Triggered by a change to a Firebase RTDB reference.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Function} The callback function.
 */
exports.helloRTDB = (event, callback) => {
  const triggerResource = event.resource;

  console.log(`Function triggered by change to: ${triggerResource}`);
  console.log(`Admin?: ${!!event.auth.admin}`);
  console.log(`Delta:`);
  console.log(JSON.stringify(event.delta, null, 2));

  // Don't forget to call the callback.
  callback();
};
// [END functions_firebase_rtdb]

// [START functions_firebase_firestore]
/**
 * Triggered by a change to a Firestore document.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Function} The callback function.
 */
exports.helloFirestore = (event, callback) => {
  const triggerResource = event.resource;

  // We're just going to log the resource string and the
  // full event to prove that it worked.
  console.log(`Function triggered by change to: ${triggerResource}`);
  console.log(JSON.stringify(event));

  // Don't forget to call the callback.
  callback();
};
// [END functions_firebase_firestore]

// [START functions_firebase_auth]
/**
 * Triggered by a change to a Firebase Auth user object.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Function} The callback function.
 */
exports.helloAuth = (event, callback) => {
  try {
    const data = event.data;
    console.log(`Function triggered by change to user: ${data.uid}`);
    console.log(`Created at: ${data.metadata.createdAt}`);

    if (event.data.email) {
      console.log(`Email: ${data.email}`);
    }
  } catch (err) {
    console.error(err);
  }
  // Don't forget to call the callback.
  callback();
};
// [END functions_firebase_auth]
