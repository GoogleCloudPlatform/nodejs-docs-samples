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

// [START functions_firebase_auth]
/**
 * Background Function triggered by a change to a Firebase Auth user object.
 *
 * @param {!Object} event The Cloud Functions event.
 */
exports.helloAuth = event => {
  try {
    console.log(`Function triggered by change to user: ${event.uid}`);
    console.log(`Created at: ${event.metadata.createdAt}`);

    if (event.email) {
      console.log(`Email: ${event.email}`);
    }
  } catch (err) {
    console.error(err);
  }
};
// [END functions_firebase_auth]
