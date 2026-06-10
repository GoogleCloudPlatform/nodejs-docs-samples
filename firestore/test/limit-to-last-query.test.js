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

const {execSync} = require('child_process');
const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});
const {Firestore, FieldPath} = require('@google-cloud/firestore');

describe('limit to last query', () => {
  const firestore = new Firestore();
  const cities = ['San Francisco', 'Los Angeles', 'Tokyo', 'Beijing'];

  before(async () => {
    await Promise.all(
      cities.map(city => firestore.doc(`cities/${city}`).set({name: city}))
    );
  });

  after(async () => {
    const cityCollectionRef = firestore.collection('cities');
    const cityDocs = (
      await cityCollectionRef.select(FieldPath.documentId()).get()
    ).docs;
    await Promise.all(
      cityDocs.map(doc => cityCollectionRef.doc(doc.id).delete())
    );
  });

  it('should run limitToLast query', () => {
    const output = exec('node limit-to-last-query.js');
    assert.include(output, 'San Francisco');
    assert.include(output, 'Tokyo');
  });
});
