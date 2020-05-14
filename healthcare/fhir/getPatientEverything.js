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

/* eslint-disable no-warning-comments */

'use strict';

const main = (
  projectId = process.env.GCLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  fhirStoreId,
  patientId
) => {
  // [START healthcare_get_patient_everything]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1');

  const getPatientEverything = async () => {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({auth});

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const patientId = '16e8a860-33b3-49be-9b03-de979feed14a';
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir/Patient/${patientId}`;
    const request = {name};

    const patientEverything = await healthcare.projects.locations.datasets.fhirStores.fhir.PatientEverything(
      request
    );
    console.log(
      `Got all resources in patient ${patientId} compartment:\n`,
      JSON.stringify(patientEverything)
    );
  };

  getPatientEverything();
  // [END healthcare_get_patient_everything]
};

// node getPatientEverything.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <patientId>
main(...process.argv.slice(2));
