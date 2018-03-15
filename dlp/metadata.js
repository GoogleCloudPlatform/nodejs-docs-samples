/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function listInfoTypes(languageCode, filter) {
  // [START dlp_list_info_types]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  // The filter to use
  // const filter = 'supported_by=INSPECT'

  dlp
    .listInfoTypes({
      languageCode: languageCode,
      filter: filter,
    })
    .then(body => {
      const infoTypes = body[0].infoTypes;
      console.log(`Info types:`);
      infoTypes.forEach(infoType => {
        console.log(`\t${infoType.name} (${infoType.displayName})`);
      });
    })
    .catch(err => {
      console.log(`Error in listInfoTypes: ${err.message || err}`);
    });
  // [END dlp_list_info_types]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `infoTypes [filter]`,
    `List the types of sensitive information the DLP API supports.`,
    {},
    opts => listInfoTypes(opts.languageCode, opts.filter)
  )
  .option('l', {
    alias: 'languageCode',
    default: 'en-US',
    type: 'string',
    global: true,
  })
  .example(`node $0 infoTypes "supported_by=INSPECT"`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
