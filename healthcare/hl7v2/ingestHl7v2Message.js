// Copyright 2019 Google LLC
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

const main = (
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  hl7v2StoreId,
  hl7v2MessageFile
) => {
  // [START healthcare_ingest_hl7v2_message]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });
  const fs = require('fs');
  const util = require('util');
  const readFile = util.promisify(fs.readFile);

  const ingestHl7v2Message = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const hl7v2StoreId = 'my-hl7v2-store';
    // const hl7v2MessageFile = 'hl7v2-message.json';
    const hl7v2Message = JSON.parse(await readFile(hl7v2MessageFile));

    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;
    const request = {parent, resource: hl7v2Message};

    const response =
      await healthcare.projects.locations.datasets.hl7V2Stores.messages.ingest(
        request
      );
    const data = response.data.hl7Ack;
    const buff = new Buffer.from(data, 'base64');
    const hl7Ack = buff.toString('ascii');
    console.log('Ingested HL7v2 message with ACK:\n', hl7Ack);
  };

  ingestHl7v2Message();
  // [END healthcare_ingest_hl7v2_message]
};

// node ingestHl7v2Message.js <projectId> <cloudRegion> <datasetId> <hl7v2StoreId> <hl7v2MessageFile>
main(...process.argv.slice(2));
