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

// [START functions_cloudevent_firebase_firestore]
/**
 * Cloud Event Function triggered by a change to a Firestore document.
 */
const functions = require('@google-cloud/functions-framework');
const protobuf = require('protobufjs');

functions.cloudEvent('helloFirestore', async cloudEvent => {
  console.log(`Function triggered by event on: ${cloudEvent.source}`);
  console.log(`Event type: ${cloudEvent.type}`);

  console.log('Loading protos...');
  const root = await protobuf.load('data.proto');
  const DocumentEventData = root.lookupType(
    'google.events.cloud.firestore.v1.DocumentEventData'
  );

  console.log('Decoding data...');
  const firestoreReceived = DocumentEventData.decode(cloudEvent.data);

  console.log('\nOld value:');
  console.log(JSON.stringify(firestoreReceived.oldValue, null, 2));

  console.log('\nNew value:');
  console.log(JSON.stringify(firestoreReceived.value, null, 2));
});

// [END functions_cloudevent_firebase_firestore]
