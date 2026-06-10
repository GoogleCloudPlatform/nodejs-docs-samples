// Copyright 2026 Google LLC.
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

// [START firestore_pipelines_quickstart]
const {Firestore} = require('@google-cloud/firestore');
const {field} = require('@google-cloud/firestore/pipelines');

// Create a new client
const firestore = new Firestore();

async function quickstartPipelines() {
  try {
    // Obtain a collection reference.
    const collection = firestore.collection('posts');

    // Create a few new posts
    for (let i = 0; i < 5; i++) {
      await collection.add({
        title: `Post ${i}`,
        rating: Math.random() * 10, // random rating on a 10 point scale
      });
    }
    console.log('Entered new data into the collection');

    // Create a Pipeline that queries the 'posts' collection.
    // Select the fields 'rating' and 'title', and convert the title to uppercase.
    // Filter the results to only include posts with rating > 5.
    const myPipeline = firestore
      .pipeline()
      .collection('posts')
      .select('rating', field('title').toUpper().as('uppercaseTitle'))
      .where(field('rating').greaterThan(5));

    // Execute the Pipeline against the Firestore server.
    const pipelineSnapshot = await myPipeline.execute();

    // Iterate over each result in the PipelineSnapshot, printing the
    // post to the console.
    pipelineSnapshot.results.forEach(pipelineResult => {
      console.log(pipelineResult.data());
    });
  } catch (error) {
    console.error(
      'Error executing pipelines quickstart:',
      error.message || error
    );
  }
}
quickstartPipelines();
// [END firestore_pipelines_quickstart]
