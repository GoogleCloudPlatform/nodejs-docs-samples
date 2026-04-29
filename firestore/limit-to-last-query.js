// Copyright 2020 Google LLC
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

// [START firestore_limit_to_last_query]
const {Firestore} = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore();

async function limitToLastQuery() {
  try {
    const collectionReference = firestore.collection('cities');
    const cityDocuments = await collectionReference
      .orderBy('name')
      .limitToLast(2)
      .get();
    const cityDocumentData = cityDocuments.docs.map(d => d.data());
    cityDocumentData.forEach(doc => {
      console.log(doc.name);
    });
  } catch (error) {
    console.error('Error executing limitToLastQuery:', error);
  }
}
limitToLastQuery();
// [END firestore_limit_to_last_query]
