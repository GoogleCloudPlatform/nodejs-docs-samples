// Copyright 2023 Google LLC
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

// [START functions_cloudevent_firebase_reactive]
const functions = require('@google-cloud/functions-framework');
const Firestore = require('@google-cloud/firestore');
const protobuf = require('protobufjs');

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

// Converts strings added to /messages/{pushId}/original to uppercase
functions.cloudEvent('makeUpperCase', async cloudEvent => {
  console.log('Loading protos...');
  const root = await protobuf.load('data.proto');
  const DocumentEventData = root.lookupType(
    'google.events.cloud.firestore.v1.DocumentEventData'
  );

  console.log('Decoding data...');
  const firestoreReceived = DocumentEventData.decode(cloudEvent.data);

  const resource = firestoreReceived.value.name;
  const affectedDoc = firestore.doc(resource.split('/documents/')[1]);

  const curValue = firestoreReceived.value.fields.original.stringValue;
  const newValue = curValue.toUpperCase();

  if (curValue === newValue) {
    // Value is already upper-case
    // Don't perform a(nother) write to avoid infinite loops
    console.log('Value is already upper-case.');
    return;
  }

  console.log(`Replacing value: ${curValue} --> ${newValue}`);
  affectedDoc.set({
    original: newValue,
  });
});
// [END functions_cloudevent_firebase_reactive]
