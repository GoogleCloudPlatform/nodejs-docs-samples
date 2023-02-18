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

import got from 'got';

// Load the project ID from GCP metadata server.
// You can also use https://www.npmjs.com/package/gcp-metadata.
exports.getProjectId = async () => {
  const METADATA_PROJECT_ID_URL =
    'http://metadata.google.internal/computeMetadata/v1/project/project-id';
  const options = {
    headers: {'Metadata-Flavor': 'Google'},
  };
  const response = await got(METADATA_PROJECT_ID_URL, options);
  return response.body;
};
