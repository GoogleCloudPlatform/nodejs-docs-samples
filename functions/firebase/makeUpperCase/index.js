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

// [START functions_firebase_reactive]
const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

// Converts strings added to /messages/{pushId}/original to uppercase
exports.makeUpperCase = event => {
  const resource = event.value.name;
  const affectedDoc = firestore.doc(resource.split('/documents/')[1]);

  const curValue = event.value.fields.original.stringValue;
  const newValue = curValue.toUpperCase();

  if (curValue !== newValue) {
    console.log(`Replacing value: ${curValue} --> ${newValue}`);

    return affectedDoc.set({
      original: newValue,
    });
  } else {
    // Value is already upper-case
    // Don't perform a(nother) write to avoid infinite loops
    console.log('Value is already upper-case.');
  }
};
// [END functions_firebase_reactive]
