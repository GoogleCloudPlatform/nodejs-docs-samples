// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(name = 'projects/my-project/secrets/my-secret/versions/1') {
  // [START secretmanager_destroy_secret_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const name = 'projects/my-project/secrets/my-secret/versions/5';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function destroySecretVersionWithEtag() {
    const [version] = await client.getSecretVersion({
      name: name,
    });
    const [destroyVersion] = await client.destroySecretVersion({
      name: name,
      etag: version.etag,
    });

    console.info(`Destroyed ${destroyVersion.name}`);
  }

  destroySecretVersionWithEtag();
  // [END secretmanager_destroy_secret_version]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
