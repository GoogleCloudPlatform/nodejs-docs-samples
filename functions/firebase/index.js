// Copyright 2018 Google LLC
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

// [START functions_firebase_rtdb]
/**
 * Background Function triggered by a change to a Firebase RTDB reference.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Object} context The Cloud Functions event context.
 */
exports.helloRTDB = (event, context) => {
  const triggerResource = context.resource;

  console.log(`Function triggered by change to: ${triggerResource}`);
  console.log(`Admin?: ${!!context.auth.admin}`);
  console.log('Delta:');
  console.log(JSON.stringify(event.delta, null, 2));
};
// [END functions_firebase_rtdb]

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

// [START functions_firebase_analytics]
/**
 * Background Function triggered by a Google Analytics for Firebase log event.
 *
 * @param {!Object} event The Cloud Functions event.
 */
exports.helloAnalytics = event => {
  const {resource} = event;
  console.log(`Function triggered by the following event: ${resource}`);

  const [analyticsEvent] = event.data.eventDim;
  console.log(`Name: ${analyticsEvent.name}`);
  console.log(`Timestamp: ${new Date(analyticsEvent.timestampMicros / 1000)}`);

  const userObj = event.data.userDim;
  console.log(`Device Model: ${userObj.deviceInfo.deviceModel}`);
  console.log(`Location: ${userObj.geoInfo.city}, ${userObj.geoInfo.country}`);
};
// [END functions_firebase_analytics]

// [START functions_firebase_remote_config]
/**
 * Background Function triggered by a change to a Firebase Remote Config value.
 *
 * @param {object} event The Cloud Functions event.
 */
exports.helloRemoteConfig = event => {
  console.log(`Update type: ${event.updateType}`);
  console.log(`Origin: ${event.updateOrigin}`);
  console.log(`Version: ${event.versionNumber}`);
};
// [END functions_firebase_remote_config]
