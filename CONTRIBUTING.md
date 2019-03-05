# How to become a contributor and submit your own code

## Contributor License Agreements

We'd love to accept your sample apps and patches! Before we can take them, we
have to jump a couple of legal hurdles.

Please fill out either the individual or corporate Contributor License Agreement
(CLA).

  * If you are an individual writing original source code and you're sure you
    own the intellectual property, then you'll need to sign an
    [individual CLA](https://developers.google.com/open-source/cla/individual).
  * If you work for a company that wants to allow you to contribute your work,
    then you'll need to sign a
    [corporate CLA](https://developers.google.com/open-source/cla/corporate).

Follow either of the two links above to access the appropriate CLA and
instructions for how to sign and return it. Once we receive it, we'll be able to
accept your pull requests.

## Setting Up An Environment
For instructions regarding development environment setup, please visit [the documentation](https://cloud.google.com/nodejs/docs/setup).

## Contributing A Patch

1. Submit an issue describing your proposed change to the repo in question.
1. The repo owner will respond to your issue promptly.
1. If your proposed change is accepted, and you haven't already done so, sign a Contributor License Agreement (see details above).
1. Fork the desired repo, develop and test your code changes.
1. Ensure that your code adheres to the existing style in the sample to which you are contributing.
1. Ensure that your code has an appropriate set of unit tests which all pass.
1. Submit a pull request!

### How to run the tests

1. You must install dependencies at the root of the `nodejs-docs-samples`
directory.

        npm install

1. In a terminal, start Redis:

        redis-server

1. In another terminal, start `memcached`:

        memcached

1. In another terminal, run the unit tests from the root of the project:

        npm test

    With code coverage:

        npm run cover

1. Then run the system tests from the root of the project:

        npm run system-test

    With code coverage:

        npm run system-cover

1. Or run all the tests at once:

        npm run all-test

    With code coverage:

        npm run all-cover

### Run the tests for a single sample

1. You must install dependencies at the root of the `nodejs-docs-samples`
directory.

        npm install

1. Change directory to one of the sample folders, e.g. `bigquery`:

        cd bigquery/

1. Run the tests (check the `package.json` file):

        npm test

    or
      
        npm run system-test


## Style

You can run `npm run lint` to match our JavaScript coding standards.

## Sample template

```js
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

function someMethod (someVariable) {
  // [START some_region_tag]
  // Imports the Google Cloud client library
  const Library = require('@google-cloud/some-library');

  // The something something, e.g. "some-value"
  // const someVariable = "some-value";

  // Instantiates a client
  const library = Library();

  // Does something
  library
    .someMethod(someVariable)
    .then((results) => {
      const someResults = results[0];

      console.log('Results:');
      someResults.forEach((result) => {
        console.log(result);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END some_region_tag]
}

const cli = require('yargs')
  .demand(1)
  .command(
    'someCommand <someVariable>',
    'Does something.',
    {},
    (opts) => someMethod(opts.someVariable)
  )
  .example('node $0 someCommand someValue', 'Does something.')
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/someProduct/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
```
