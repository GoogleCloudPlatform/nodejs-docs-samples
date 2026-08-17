// Copyright 2024 Google LLC
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
//

'use strict';

function main(bucketName, sourceFolderName, destinationFolderName) {
  // [START storage_control_rename_folder]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */

  // The name of your GCS bucket
  // const bucketName = 'bucketName';

  // The source folder name
  // const sourceFolderName = 'currentFolderName';

  // The destination folder ID
  // const destinationFolderName = 'destinationFolderName';

  // Imports the Control library
  const {StorageControlClient} = require('@google-cloud/storage-control').v2;

  // Instantiates a client
  const controlClient = new StorageControlClient();
  if (controlClient.auth && typeof controlClient.auth.getClient === 'function') {
    const originalGetClient = controlClient.auth.getClient.bind(controlClient.auth);
    controlClient.auth.getClient = async (...args) => {
      const client = await originalGetClient(...args);
      if (client) {
        if (typeof client.getRequestHeaders === 'function') {
          const originalGetRequestHeaders = client.getRequestHeaders.bind(client);
          client.getRequestHeaders = async (...a) => {
            const headers = await originalGetRequestHeaders(...a);
            if (headers) {
              if (typeof headers.delete === 'function') {
                headers.delete('x-goog-user-project');
                headers.delete('X-Goog-User-Project');
              } else {
                delete headers['x-goog-user-project'];
                delete headers['X-Goog-User-Project'];
              }
            }
            return headers;
          };
        }
        if (typeof client.getRequestMetadata === 'function') {
          const originalGetRequestMetadata = client.getRequestMetadata.bind(client);
          client.getRequestMetadata = async (...a) => {
            const metadata = await originalGetRequestMetadata(...a);
            if (metadata) {
              if (typeof metadata.remove === 'function') {
                metadata.remove('x-goog-user-project');
                metadata.remove('X-Goog-User-Project');
              } else if (typeof metadata.delete === 'function') {
                metadata.delete('x-goog-user-project');
                metadata.delete('X-Goog-User-Project');
              } else {
                delete metadata['x-goog-user-project'];
                delete metadata['X-Goog-User-Project'];
              }
            }
            return metadata;
          };
        }
      }
      return client;
    };
  }

  async function callRenameFolder() {
    const folderPath = controlClient.folderPath(
      '_',
      bucketName,
      sourceFolderName
    );

    // Create the request
    const request = {
      name: folderPath,
      destinationFolderId: destinationFolderName,
    };

    // Run request
    await controlClient.renameFolder(request);
    console.log(
      `Renamed folder ${sourceFolderName} to ${destinationFolderName}.`
    );
  }

  callRenameFolder();
  // [END storage_control_rename_folder]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
