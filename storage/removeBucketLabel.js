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

// sample-metadata:
//   title: Storage Remove Bucket Label.
//   description: Removes bucket label.
//   usage: node removeBucketLabel.js <BUCKET_NAME> <LABEL_KEY>)

function main(bucketName = 'my-bucket', labelKey = 'labelone') {
  // [START storage_remove_bucket_label]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // The key of the label to remove from the bucket
  // const labelKey = 'label-key-to-remove';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function removeBucketLabel() {
    try {
      const labels = {};
      // To remove a label set the value of the key to null.
      labels[labelKey] = null;
      await storage.bucket(bucketName).setMetadata({labels});
      console.log(`Removed labels from bucket ${bucketName}`);
    } catch (error) {
      console.error(
        'Error executing remove bucket label:',
        error.message || error
      );
    }
  }

  removeBucketLabel();
  // [END storage_remove_bucket_label]
}

main(...process.argv.slice(2));
