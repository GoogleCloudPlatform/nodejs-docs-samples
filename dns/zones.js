/**
 * Copyright 2016, Google, Inc.
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

const DNS = require('@google-cloud/dns');

// [START dns_list_zones]
function listZones (callback) {
  // Instantiates a client
  const dns = DNS();

  // Lists all zones in the current project
  dns.getZones((err, zones) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Zones:');
    zones.forEach((zone) => console.log(zone.name));
    callback();
  });
}
// [END dns_list_zones]

// The command-line program
const cli = require('yargs');
const makeHandler = require('../utils').makeHandler;

const program = module.exports = {
  listZones: listZones,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('list', 'Lists all zones in the current project.', {}, () => {
    program.listZones(makeHandler(false));
  })
  .example('node $0 list', 'Lists all zones in the current project.')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/dns/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
