<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Key Management Service Node.js Samples

[![Build](https://storage.googleapis.com/cloud-docs-samples-badges/GoogleCloudPlatform/nodejs-docs-samples/nodejs-docs-samples-kms.svg)]()

[Cloud KMS](https://cloud.google.com/kms/docs/) allows you to keep encryption keys in one central cloud service, for direct use by other cloud resources and applications. With Cloud KMS you are the ultimate custodian of your data, you can manage encryption in the cloud the same way you do on-premises, and you have a provable and monitorable root of trust over your data.

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [KMS](#kms)
* [Running the tests](#running-the-tests)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

        npm install


[prereq]: ../README.md#prerequisites
[run]: ../README.md#how-to-run-a-sample

## Samples

### KMS

View the [documentation][kms_0_docs] or the [source code][kms_0_code].

__Usage:__ `node keys.js --help`

```
Commands:
  create <keyRing> <cryptoKey>                                  Creates a crypto key.
  decrypt <keyRing> <cryptoKey> <ciphertextFileName>            Decrypts a file.
  <plaintextFileName>
  encrypt <keyRing> <cryptoKey> <plaintextFileName>             Encrypts a file.
  <ciphertextFileName>
  get <keyRing> <cryptoKey>                                     Gets a crypto key.
  get-policy <keyRing> <cryptoKey>                              Gets a crypto key's IAM policy.
  grant-access <keyRing> <cryptoKey> <member> <role>            Adds a members to a crypto key's IAM policy.
  keyrings <command>                                            Access key rings subcommands.
  list <keyRing>                                                Lists crypto keys.
  revoke-access <keyRing> <cryptoKey> <member> <role>           Removes a member from a crypto key's IAM policy.
  set-primary <keyRing> <cryptoKey> <version>                   Sets a crypto key's primary version.
  versions <command>                                            Access crypto key versions subcommands.

Options:
  --help           Show help                                                                                   [boolean]
  --location, -l                                                                            [string] [default: "global"]
  --projectId, -p                                                                                               [string]

Examples:
  node keys.js keyrings create "my-key-ring"
  node keys.js keyrings list
  node keys.js keyrings get-policy "my-key-ring"
  node keys.js keyrings grant-access "my-key-ring" "user:developer@company.com" "roles/viewer"
  node keys.js keyrings revoke-access "my-key-ring" "user:developer@company.com" "roles/viewer"
  node keys.js create "my-key-ring" "my-key"
  node keys.js list
  node keys.js encrypt "my-key-ring" "my-key" ./resources/plaintext.txt ./resources/plaintext.txt.encrypted
  node keys.js decrypt "my-key-ring" "my-key" ./resources/plaintext.txt.encrypted ./resources/plaintext.txt.decrypted
  node keys.js set-primary "my-key-ring" "my-key" 123
  node keys.js get-policy "my-key-ring" "my-key"
  node keys.js grant-access "my-key-ring" "my-key" "user:developer@company.com" "roles/viewer"
  node keys.js revoke-access "my-key-ring" "my-key" "user:developer@company.com" "roles/viewer"
  node keys.js versions create "my-key-ring" "my-key"
  node keys.js versions list "my-key-ring" "my-key"
  node keys.js versions destroy "my-key-ring" "my-key" 123
  node keys.js versions restore "my-key-ring" "my-key" 123
  node keys.js versions disable "my-key-ring" "my-key" 123
  node keys.js versions enable "my-key-ring" "my-key" 123

For more information, see https://cloud.google.com/kms/docs
```

[kms_0_docs]: https://cloud.google.com/kms/docs
[kms_0_code]: keys.js

## Running the tests

1.  Set the **GCLOUD_PROJECT** and **GOOGLE_APPLICATION_CREDENTIALS** environment variables.

1.  Run the tests:

        npm test