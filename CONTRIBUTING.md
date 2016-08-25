# How to become a contributor and submit your own code

## Contributor License Agreements

We'd love to accept your sample apps and patches! Before we can take them, we
have to jump a couple of legal hurdles.

Please fill out either the individual or corporate Contributor License Agreement
(CLA).

  * If you are an individual writing original source code and you're sure you
    own the intellectual property, then you'll need to sign an [individual CLA]
    (https://developers.google.com/open-source/cla/individual).
  * If you work for a company that wants to allow you to contribute your work,
    then you'll need to sign a [corporate CLA]
    (https://developers.google.com/open-source/cla/corporate).

Follow either of the two links above to access the appropriate CLA and
instructions for how to sign and return it. Once we receive it, we'll be able to
accept your pull requests.

## Contributing A Patch

1. Submit an issue describing your proposed change to the repo in question.
1. The repo owner will respond to your issue promptly.
1. If your proposed change is accepted, and you haven't already done so, sign a Contributor License Agreement (see details above).
1. Fork the desired repo, develop and test your code changes.
1. Ensure that your code adheres to the existing style in the sample to which you are contributing.
1. Ensure that your code has an appropriate set of unit tests which all pass.
1. Submit a pull request!

## Style

Samples in this repository follow the [JavaScript Semi-Standard
Style](https://github.com/Flet/semistandard).

You can run `npm run lint` to match our JavaScript coding standards.

## Sample template

```
<LICENSE_HEADER>

// [START all]
// [START setup]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var <API_CLIENT> = require('@google-cloud/<API>');

// Instantiate a <API> client
var <CLIENT> = <API_CLIENT>();
// [END setup]

// [START <REGION_TAG_NAME>]
/**
 * <DESCRIPTION>
 *
 * @param {<TYPE>} <NAME> <DESCRIPTION>.
 * @param {function} cb The callback function.
 */
function <METHOD_NAME> (<ARGUMENTS>, callback) {
  // <SETUP>

  // <RUN SAMPLE CODE>

  // Inside callback: console.log(<MESSAGE>)
}
// [END <REGION_TAG_NAME>]

// The command-line program
var cli = require('yargs');

var program = module.exports = {
  <METHOD_NAME>: <METHOD_NAME>,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('<COMMAND> <ARGS>', '<DESCRIPTION>.', {}, function (options) {
    program.<METHOD_NAME>(options, console.log);
  })
  .example('node $0 <COMMAND> <ARGS>', '<DESCRIPTION>.')
  .wrap(100)
  .recommendCommands()
  .epilogue('For more information, see <DOCS_LINK>');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
```
