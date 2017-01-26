<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud KMS API Node.js Samples

The [Cloud KMS API][kms_docs] is a service that allows you to keep encryption
keys centrally in the cloud, for direct use by cloud services.

[kms_docs]: https://cloud.google.com/kms/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Quickstart](#quickstart)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Quickstart

View the [documentation][quickstart_docs] or the [source code][quickstart_code].

Run the sample:

    node quickstart.js

[quickstart_docs]: https://cloud.google.com/kms/docs
[quickstart_code]: hostedmodels.js

### Keys

View the [documentation][keys_docs] or the [source code][keys_code].

__Usage:__ `node keys.js --help`

```
Commands:
  create <keyRingName> <keyName>                            Creates a crypto key.
  decrypt <keyRingName> <keyName> <infile> <outfile>        Decrypts a file.
  encrypt <keyRingName> <keyName> <infile> <outfile>        Encrypts a file.
  get <keyRingName> <keyName>                               Gets a crypto key.
  get-policy <keyRingName> <keyName>                        Gets a crypto key's IAM policy.
  grant-access <keyRingName> <keyName> <member> <role>      Adds a members to a crypto key's IAM policy.
  keyrings <command>                                        Access key rings subcommands.
  list <keyRingName>                                        Lists crypto keys.
  revoke-access <keyRingName> <keyName> <member> <role>     Removes a member from a crypto key's IAM policy.
  set-primary <keyRingName> <keyName> <version>             Sets a crypto key's primary version.
  versions <command>                                        Access crypto key versions subcommands.

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

[keys_docs]: https://cloud.google.com/kms/docs
[keys_code]: keys.js
