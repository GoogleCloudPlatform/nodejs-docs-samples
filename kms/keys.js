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

function createKeyRing (projectId, location, keyRingName) {
  // [START kms_create_keyring]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the new key ring, e.g. "global"
  // const location = 'global';

  // The name of the new key ring, e.g. "my-new-key-ring"
  // const keyRingName = 'my-new-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${location}`,
      // This will be a path parameter in the request URL
      keyRingId: keyRingName
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.create(request, (err, keyRing) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Key ring ${keyRing.name} created.`);
    });
  });
  // [END kms_create_keyring]
}

function listKeyRings (projectId, location) {
  // [START kms_list_keyrings]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location from which to list key rings, e.g. "global"
  // const location = 'global';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${location}`
    };

    // Lists key rings
    cloudkms.projects.locations.keyRings.list(request, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      const keyRings = result.keyRings || [];

      if (keyRings.length) {
        keyRings.forEach((keyRing) => {
          console.log(`${keyRing.name}:`);
          console.log(`  Created: ${new Date(keyRing.createTime)}`);
        });
      } else {
        console.log('No key rings found.');
      }
    });
  });
  // [END kms_list_keyrings]
}

function getKeyRing (projectId, location, keyRingName) {
  // [START kms_get_keyring]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const location = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`
    };

    // Gets a key ring
    cloudkms.projects.locations.keyRings.get(request, (err, keyRing) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Name: ${keyRing.name}`);
      console.log(`Created: ${new Date(keyRing.createTime)}`);
    });
  });
  // [END kms_get_keyring]
}

function getKeyRingIamPolicy (projectId, location, keyRingName) {
  // [START kms_get_keyring_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const location = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`
    };

    // Gets the IAM policy of a key ring
    cloudkms.projects.locations.keyRings.getIamPolicy(request, (err, policy) => {
      if (err) {
        console.log(err);
        return;
      }

      if (policy.bindings) {
        policy.bindings.forEach((binding) => {
          if (binding.members && binding.members.length) {
            console.log(`${binding.role}:`);
            binding.members.forEach((member) => {
              console.log(`  ${member}`);
            });
          }
        });
      } else {
        console.log(`Policy for key ring ${keyRingName} is empty.`);
      }
    });
  });
  // [END kms_get_keyring_policy]
}

function addMemberToKeyRingPolicy (projectId, location, keyRingName, member, role) {
  // [START kms_add_member_to_keyring_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const location = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The member to add to the key ring, e.g. "user:developer@company.com"
  // const member = 'user:developer@company.com';

  // The role to give the member, e.g. "roles/viewer"
  // const role = 'roles/viewer';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    let request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`
    };

    // Gets the IAM policy of a key ring
    cloudkms.projects.locations.keyRings.getIamPolicy(request, (err, policy) => {
      if (err) {
        console.log(err);
        return;
      }

      policy = Object.assign({ bindings: [] }, policy);

      const index = policy.bindings.findIndex((binding) => binding.role === role);

      // Add the role/member combo to the policy
      const binding = Object.assign({
        role: role,
        members: []
      }, policy.bindings[index]);
      if (index === -1) {
        policy.bindings.push(binding);
      }
      if (!binding.members.includes(member)) {
        binding.members.push(member);
      }

      request = {
        // This will be a path parameter in the request URL
        resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`,
        // This will be the request body
        resource: {
          policy: policy
        }
      };

      // Adds the member/role combo to the policy of the key ring
      cloudkms.projects.locations.keyRings.setIamPolicy(request, (err, policy) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`${member}/${role} combo added to policy for key ring ${keyRingName}.`);
        if (policy.bindings) {
          policy.bindings.forEach((binding) => {
            if (binding.members && binding.members.length) {
              console.log(`${binding.role}:`);
              binding.members.forEach((member) => {
                console.log(`  ${member}`);
              });
            }
          });
        } else {
          console.log(`Policy for key ring ${keyRingName} is empty.`);
        }
      });
    });
  });
  // [END kms_add_member_to_keyring_policy]
}

function removeMemberFromKeyRingPolicy (projectId, location, keyRingName, member, role) {
  // [START kms_remove_member_from_keyring_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const location = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The member to add to the key ring, e.g. "user:developer@company.com"
  // const member = 'user:developer@company.com';

  // The role to give the member, e.g. "roles/viewer"
  // const role = 'roles/viewer';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    let request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`
    };

    // Gets the IAM policy of a key ring
    cloudkms.projects.locations.keyRings.getIamPolicy(request, (err, policy) => {
      if (err) {
        console.log(err);
        return;
      }

      policy = Object.assign({ bindings: [] }, policy);

      let index = policy.bindings.findIndex((binding) => binding.role === role);

      const binding = Object.assign({
        role: role,
        members: []
      }, policy.bindings[index]);
      if (index === -1) {
        return;
      }
      if (!binding.members.includes(member)) {
        return;
      }

      // Remove the role/member combo from the policy
      binding.members.splice(binding.members.indexOf(member), 1);

      request = {
        // This will be a path parameter in the request URL
        resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`,
        // This will be the request body
        resource: {
          policy: policy
        }
      };

      // Removes the role/member combo from the policy of the key ring
      cloudkms.projects.locations.keyRings.setIamPolicy(request, (err, policy) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`${member}/${role} combo removed from policy for key ring ${keyRingName}.`);
        if (policy.bindings) {
          policy.bindings.forEach((binding) => {
            if (binding.members && binding.members.length) {
              console.log(`${binding.role}:`);
              binding.members.forEach((member) => {
                console.log(`  ${member}`);
              });
            }
          });
        } else {
          console.log(`Policy for key ring ${keyRingName} is empty.`);
        }
      });
    });
  });
  // [END kms_remove_member_from_keyring_policy]
}

function createCryptoKey (projectId, location, keyRingName, keyName) {
  // [START kms_create_cryptokey]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the new crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the new crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name for the new crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`,
      // This will be a path parameter in the request URL
      cryptoKeyId: keyName,

      resource: {
        // This will allow the API access to the key for encryption and decryption
        purpose: 'ENCRYPT_DECRYPT'
      }
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.cryptoKeys.create(request, (err, cryptoKey) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Key ${cryptoKey.name} created.`);
    });
  });
  // [END kms_create_cryptokey]
}

function listCryptoKeys (projectId, location, keyRingName) {
  // [START kms_list_cryptokeys]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring from which to list crypto keys, e.g. "global"
  // const location = 'global';

  // The name of the key ring from which to list crypto keys, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}`
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.cryptoKeys.list(request, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      const cryptoKeys = result.cryptoKeys || [];

      if (cryptoKeys.length) {
        cryptoKeys.forEach((cryptoKey) => {
          console.log(`${cryptoKey.name}:`);
          console.log(`  Created: ${new Date(cryptoKey.createTime)}`);
          console.log(`  Purpose: ${cryptoKey.purpose}`);
          console.log(`  Primary: ${cryptoKey.primary.name}`);
          console.log(`    State: ${cryptoKey.primary.state}`);
          console.log(`    Created: ${new Date(cryptoKey.primary.createTime)}`);
        });
      } else {
        console.log('No crypto keys found.');
      }
    });
  });
  // [END kms_list_cryptokeys]
}

function encrypt (projectId, location, keyRingName, keyName, infile, outfile) {
  // [START kms_encrypt]
  const fs = require('fs');

  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The path to the file to encrypt, e.g. "./path/to/plaintext.txt"
  // const infile = './path/to/plaintext.txt';

  // The path where the encrypted file should be written, e.g. "./path/to/plaintext.txt.encrypted"
  // const outfile = './path/to/plaintext.txt.encrypted';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    // Reads the file to be encrypted
    fs.readFile(infile, (err, contentsBuffer) => {
      if (err) {
        console.log(err);
        return;
      }

      const request = {
        // This will be a path parameter in the request URL
        name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`,
        // This will be the request body
        resource: {
          plaintext: contentsBuffer.toString('base64')
        }
      };

      // Encrypts the file using the specified crypto key
      cloudkms.projects.locations.keyRings.cryptoKeys.encrypt(request, (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        // Writes the encrypted file to disk
        fs.writeFile(outfile, Buffer.from(result.ciphertext), (err) => {
          if (err) {
            console.log(err);
            return;
          }

          console.log(`Encrypted ${infile} using ${result.name}.`);
          console.log(`Result saved to ${outfile}.`);
        });
      });
    });
  });
  // [END kms_encrypt]
}

function decrypt (projectId, location, keyRingName, keyName, infile, outfile) {
  // [START kms_decrypt]
  const fs = require('fs');

  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The path to the file to decrypt, e.g. "./path/to/plaintext.txt.encrypted"
  // const infile = './path/to/plaintext.txt.encrypted';

  // The path where the decrypted file should be written, e.g. "./path/to/plaintext.txt.decrypted"
  // const outfile = './path/to/plaintext.txt.decrypted';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    // Reads the file to be decrypted
    fs.readFile(infile, 'utf8', (err, contentsBuffer) => {
      if (err) {
        console.log(err);
        return;
      }

      const request = {
        // This will be a path parameter in the request URL
        name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`,
        // This will be the request body
        resource: {
          ciphertext: contentsBuffer
        }
      };

      // Dencrypts the file using the specified crypto key
      cloudkms.projects.locations.keyRings.cryptoKeys.decrypt(request, (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        // Writes the dencrypted file to disk
        fs.writeFile(outfile, Buffer.from(result.plaintext, 'base64'), (err) => {
          if (err) {
            console.log(err);
            return;
          }

          console.log(`Decrypted ${infile}, result saved to ${outfile}.`);
        });
      });
    });
  });
  // [END kms_decrypt]
}

function getCryptoKey (projectId, location, keyRingName, keyName) {
  // [START kms_get_cryptokey]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`
    };

    // Gets a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.get(request, (err, cryptoKey) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Name: ${cryptoKey.name}:`);
      console.log(`Created: ${new Date(cryptoKey.createTime)}`);
      console.log(`Purpose: ${cryptoKey.purpose}`);
      console.log(`Primary: ${cryptoKey.primary.name}`);
      console.log(`  State: ${cryptoKey.primary.state}`);
      console.log(`  Created: ${new Date(cryptoKey.primary.createTime)}`);
    });
  });
  // [END kms_get_cryptokey]
}

function setPrimaryCryptoKeyVersion (projectId, location, keyRingName, keyName, version) {
  // [START kms_set_cryptokey_primary_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The version's id, e.g. 123
  // const version = 123;

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`,
      // This will be the request body
      resource: {
        cryptoKeyVersionId: `${version}`
      }
    };

    // Sets a crypto key's primary version
    cloudkms.projects.locations.keyRings.cryptoKeys.updatePrimaryVersion(request, (err, cryptoKey) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Set ${version} as primary version for crypto key ${keyName}.\n`);
      console.log(`Name: ${cryptoKey.name}:`);
      console.log(`Created: ${new Date(cryptoKey.createTime)}`);
      console.log(`Purpose: ${cryptoKey.purpose}`);
      console.log(`Primary: ${cryptoKey.primary.name}`);
      console.log(`  State: ${cryptoKey.primary.state}`);
      console.log(`  Created: ${new Date(cryptoKey.primary.createTime)}`);
    });
  });
  // [END kms_set_cryptokey_primary_version]
}

function getCryptoKeyIamPolicy (projectId, location, keyRingName, keyName) {
  // [START kms_get_cryptokey_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`
    };

    // Gets the IAM policy of a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.getIamPolicy(request, (err, policy) => {
      if (err) {
        console.log(err);
        return;
      }

      if (policy.bindings) {
        policy.bindings.forEach((binding) => {
          if (binding.members && binding.members.length) {
            console.log(`${binding.role}:`);
            binding.members.forEach((member) => {
              console.log(`  ${member}`);
            });
          }
        });
      } else {
        console.log(`Policy for crypto key ${keyName} is empty.`);
      }
    });
  });
  // [END kms_get_cryptokey_policy]
}

function addMemberToCryptoKeyPolicy (projectId, location, keyRingName, keyName, member, role) {
  // [START kms_add_member_to_cryptokey_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The member to add to the crypto key, e.g. "user:developer@company.com"
  // const member = 'user:developer@company.com';

  // The role to give the member, e.g. "roles/viewer"
  // const role = 'roles/viewer';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    let request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`
    };

    // Gets the IAM policy of a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.getIamPolicy(request, (err, policy) => {
      if (err) {
        console.log(err);
        return;
      }

      policy = Object.assign({ bindings: [] }, policy);

      const index = policy.bindings.findIndex((binding) => binding.role === role);

      // Add the role/member combo to the policy
      const binding = Object.assign({
        role: role,
        members: []
      }, policy.bindings[index]);
      if (index === -1) {
        policy.bindings.push(binding);
      }
      if (!binding.members.includes(member)) {
        binding.members.push(member);
      }

      request = {
        // This will be a path parameter in the request URL
        resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`,
        // This will be the request body
        resource: {
          policy: policy
        }
      };

      // Adds the member/role combo to the policy of the crypto key
      cloudkms.projects.locations.keyRings.cryptoKeys.setIamPolicy(request, (err, policy) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`${member}/${role} combo added to policy for crypto key ${keyName}.`);
        if (policy.bindings) {
          policy.bindings.forEach((binding) => {
            if (binding.members && binding.members.length) {
              console.log(`${binding.role}:`);
              binding.members.forEach((member) => {
                console.log(`  ${member}`);
              });
            }
          });
        } else {
          console.log(`Policy for crypto key ${keyName} is empty.`);
        }
      });
    });
  });
  // [END kms_add_member_to_cryptokey_policy]
}

function removeMemberFromCryptoKeyPolicy (projectId, location, keyRingName, keyName, member, role) {
  // [START kms_remove_member_from_cryptokey_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The member to add to the crypto key, e.g. "user:developer@company.com"
  // const member = 'user:developer@company.com';

  // The role to give the member, e.g. "roles/viewer"
  // const role = 'roles/viewer';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    let request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`
    };

    // Gets the IAM policy of a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.getIamPolicy(request, (err, policy) => {
      if (err) {
        console.log(err);
        return;
      }

      policy = Object.assign({ bindings: [] }, policy);

      let index = policy.bindings.findIndex((binding) => binding.role === role);

      const binding = Object.assign({
        role: role,
        members: []
      }, policy.bindings[index]);
      if (index === -1) {
        return;
      }
      if (!binding.members.includes(member)) {
        return;
      }

      // Remove the role/member combo from the policy
      binding.members.splice(binding.members.indexOf(member), 1);

      request = {
        // This will be a path parameter in the request URL
        resource_: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`,
        // This will be the request body
        resource: {
          policy: policy
        }
      };

      console.log(JSON.stringify(request, null, 2));

      // Removes the member/role combo from the policy of the crypto key
      cloudkms.projects.locations.keyRings.cryptoKeys.setIamPolicy(request, (err, policy) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`${member}/${role} combo removed from policy for crypto key ${keyName}.`);
        if (policy.bindings) {
          policy.bindings.forEach((binding) => {
            if (binding.members && binding.members.length) {
              console.log(`${binding.role}:`);
              binding.members.forEach((member) => {
                console.log(`  ${member}`);
              });
            }
          });
        } else {
          console.log(`Policy for crypto key ${keyName} is empty.`);
        }
      });
    });
  });
  // [END kms_remove_member_from_cryptokey_policy]
}

function createCryptoKeyVersion (projectId, location, keyRingName, keyName) {
  // [START kms_create_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`
    };

    // Creates a new crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.create(request, (err, cryptoKeyVersion) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Crypto key version ${cryptoKeyVersion.name} created.`);
    });
  });
  // [END kms_create_cryptokey_version]
}

function listCryptoKeyVersions (projectId, location, keyRingName, keyName) {
  // [START kms_list_cryptokey_versions]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the crypto key from which to list versions, e.g. "my-key"
  // const keyName = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}`
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.list(request, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      const cryptoKeyVersions = result.cryptoKeyVersions || [];

      if (cryptoKeyVersions.length) {
        cryptoKeyVersions.forEach((version) => {
          console.log(`${version.name}:`);
          console.log(`  Created: ${new Date(version.createTime)}`);
          console.log(`  State: ${version.state}`);
        });
      } else {
        console.log('No crypto key versions found.');
      }
    });
  });
  // [END kms_list_cryptokey_versions]
}

function destroyCryptoKeyVersion (projectId, location, keyRingName, keyName, version) {
  // [START kms_destroy_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The version's id, e.g. 123
  // const version = 123;

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}/cryptoKeyVersions/${version}`
    };

    // Destroys a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.destroy(request, (err, cryptoKeyVersion) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Crypto key version ${cryptoKeyVersion.name} destroyed.`);
    });
  });
  // [END kms_destroy_cryptokey_version]
}

function restoreCryptoKeyVersion (projectId, location, keyRingName, keyName, version) {
  // [START kms_restore_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The version's id, e.g. 123
  // const version = 123;

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}/cryptoKeyVersions/${version}`
    };

    // Restores a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.restore(request, (err, cryptoKeyVersion) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Crypto key version ${cryptoKeyVersion.name} restored.`);
    });
  });
  // [END kms_restore_cryptokey_version]
}

function enableCryptoKeyVersion (projectId, location, keyRingName, keyName, version) {
  // [START kms_enable_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The version's id, e.g. 123
  // const version = 123;

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    let request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}/cryptoKeyVersions/${version}`
    };

    // Gets a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.get(request, (err, cryptoKeyVersion) => {
      if (err) {
        console.log(err);
        return;
      }

      cryptoKeyVersion.state = 'ENABLED';

      request = {
        // This will be a path parameter in the request URL
        name: request.name,
        // This will be a query parameter in the request URL
        updateMask: 'state',
        // This will be the request body
        resource: cryptoKeyVersion
      };

      // Enables a crypto key version
      cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.patch(request, (err, cryptoKeyVersion) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Crypto key version ${cryptoKeyVersion.name} enabled.`);
      });
    });
  });
  // [END kms_enable_cryptokey_version]
}

function disableCryptoKeyVersion (projectId, location, keyRingName, keyName, version) {
  // [START kms_disable_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const location = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingName = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const keyName = 'my-key';

  // The version's id, e.g. 123
  // const version = 123;

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    let request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${location}/keyRings/${keyRingName}/cryptoKeys/${keyName}/cryptoKeyVersions/${version}`
    };

    // Gets a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.get(request, (err, cryptoKeyVersion) => {
      if (err) {
        console.log(err);
        return;
      }

      cryptoKeyVersion.state = 'DISABLED';

      request = {
        // This will be a path parameter in the request URL
        name: request.name,
        // This will be a query parameter in the request URL
        updateMask: 'state',
        // This will be the request body
        resource: cryptoKeyVersion
      };

      // Disables a crypto key version
      cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.patch(request, (err, cryptoKeyVersion) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Crypto key version ${cryptoKeyVersion.name} disabled.`);
      });
    });
  });
  // [END kms_disable_cryptokey_version]
}

/* eslint-disable indent */
  // [START kms_create_keyring]
  // [START kms_list_keyrings]
  // [START kms_get_keyring]
  // [START kms_get_keyring_policy]
  // [START kms_add_member_to_keyring_policy]
  // [START kms_remove_member_from_keyring_policy]
  // [START kms_create_cryptokey]
  // [START kms_list_cryptokeys]
  // [START kms_encrypt]
  // [START kms_decrypt]
  // [START kms_get_cryptokey]
  // [START kms_set_cryptokey_primary_version]
  // [START kms_get_cryptokey_policy]
  // [START kms_add_member_to_cryptokey_policy]
  // [START kms_remove_member_from_cryptokey_policy]
  // [START kms_list_cryptokey_versions]
  // [START kms_create_cryptokey_version]
  // [START kms_destroy_cryptokey_version]
  // [START kms_restore_cryptokey_version]
  // [START kms_enable_cryptokey_version]
  // [START kms_disable_cryptokey_version]

  function buildAndAuthorizeService (callback) {
    // Imports the Google APIs client library
    const google = require('googleapis');

    // Acquires credentials
    google.auth.getApplicationDefault((err, authClient) => {
      if (err) {
        callback(err);
        return;
      }

      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
        authClient = authClient.createScoped([
          'https://www.googleapis.com/auth/cloud-platform'
        ]);
      }

      // Instantiates an authorized client
      const cloudkms = google.cloudkms({
        version: 'v1beta1',
        auth: authClient
      });

      callback(null, cloudkms);
    });
  }
  // [END kms_create_keyring]
  // [END kms_list_keyrings]
  // [END kms_get_keyring]
  // [END kms_get_keyring_policy]
  // [END kms_add_member_to_keyring_policy]
  // [END kms_remove_member_from_keyring_policy]
  // [END kms_create_cryptokey]
  // [END kms_list_cryptokeys]
  // [END kms_encrypt]
  // [END kms_decrypt]
  // [END kms_get_cryptokey]
  // [END kms_set_cryptokey_primary_version]
  // [END kms_get_cryptokey_policy]
  // [END kms_add_member_to_cryptokey_policy]
  // [END kms_remove_member_from_cryptokey_policy]
  // [END kms_list_cryptokey_versions]
  // [END kms_create_cryptokey_version]
  // [END kms_destroy_cryptokey_version]
  // [END kms_restore_cryptokey_version]
  // [END kms_enable_cryptokey_version]
  // [END kms_disable_cryptokey_version]
/* eslint-disable indent */

const cli = require(`yargs`)
  .demand(1)
  .command(
    `create <keyRingName> <keyName>`,
    `Creates a crypto key.`,
    {},
    (opts) => createCryptoKey(opts.projectId, opts.location, opts.keyRingName, opts.keyName)
  )
  .command(
    `decrypt <keyRingName> <keyName> <infile> <outfile>`,
    `Decrypts a file.`,
    {},
    (opts) => decrypt(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.infile, opts.outfile)
  )
  .command(
    `encrypt <keyRingName> <keyName> <infile> <outfile>`,
    `Encrypts a file.`,
    {},
    (opts) => encrypt(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.infile, opts.outfile)
  )
  .command(
    `get <keyRingName> <keyName>`,
    `Gets a crypto key.`,
    {},
    (opts) => getCryptoKey(opts.projectId, opts.location, opts.keyRingName, opts.keyName)
  )
  .command(
    `get-policy <keyRingName> <keyName>`,
    `Gets a crypto key's IAM policy.`,
    {},
    (opts) => getCryptoKeyIamPolicy(opts.projectId, opts.location, opts.keyRingName, opts.keyName)
  )
  .command(
    `grant-access <keyRingName> <keyName> <member> <role>`,
    `Adds a members to a crypto key's IAM policy.`,
    {},
    (opts) => addMemberToCryptoKeyPolicy(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.member, opts.role)
  )
  .command(
    `keyrings <command>`,
    `Access key rings subcommands.`,
    (yargs) => {
      yargs
        .command(
          `create <keyRingName>`,
          `Creates a key ring.`,
          {},
          (opts) => createKeyRing(opts.projectId, opts.location, opts.keyRingName)
        )
        .command(
          `list`,
          `Lists key rings.`,
          {},
          (opts) => listKeyRings(opts.projectId, opts.location)
        )
        .command(
          `get <keyRingName>`,
          `Gets a key ring.`,
          {},
          (opts) => getKeyRing(opts.projectId, opts.location, opts.keyRingName)
        )
        .command(
          `get-policy <keyRingName>`,
          `Gets a key ring's IAM policy.`,
          {},
          (opts) => getKeyRingIamPolicy(opts.projectId, opts.location, opts.keyRingName)
        )
        .command(
          `grant-access <keyRingName> <member> <role>`,
          `Adds a members to a key ring's IAM policy.`,
          {},
          (opts) => addMemberToKeyRingPolicy(opts.projectId, opts.location, opts.keyRingName, opts.member, opts.role)
        )
        .command(
          `revoke-access <keyRingName> <member> <role>`,
          `Removes a member from a key ring's IAM policy.`,
          {},
          (opts) => removeMemberFromKeyRingPolicy(opts.projectId, opts.location, opts.keyRingName, opts.member, opts.role)
        );
    },
    () => {}
  )
  .command(
    `list <keyRingName>`,
    `Lists crypto keys.`,
    {},
    (opts) => listCryptoKeys(opts.projectId, opts.location, opts.keyRingName)
  )
  .command(
    `revoke-access <keyRingName> <keyName> <member> <role>`,
    `Removes a member from a crypto key's IAM policy.`,
    {},
    (opts) => removeMemberFromCryptoKeyPolicy(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.member, opts.role)
  )
  .command(
    `set-primary <keyRingName> <keyName> <version>`,
    `Sets a crypto key's primary version.`,
    {},
    (opts) => setPrimaryCryptoKeyVersion(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.version)
  )
  .command(
    `versions <command>`,
    `Access crypto key versions subcommands.`,
    (yargs) => {
      yargs
        .command(
          `create <keyRingName> <keyName>`,
          `Creates a crypto key version.`,
          {},
          (opts) => createCryptoKeyVersion(opts.projectId, opts.location, opts.keyRingName, opts.keyName)
        )
        .command(
          `destroy <keyRingName> <keyName> <version>`,
          `Destroys a crypto key version.`,
          {},
          (opts) => destroyCryptoKeyVersion(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.version)
        )
        .command(
          `disable <keyRingName> <keyName> <version>`,
          `Disables a crypto key version.`,
          {},
          (opts) => disableCryptoKeyVersion(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.version)
        )
        .command(
          `enable <keyRingName> <keyName> <version>`,
          `Enables a crypto key version.`,
          {},
          (opts) => enableCryptoKeyVersion(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.version)
        )
        .command(
          `list <keyRingName> <keyName>`,
          `Lists crypto key versions.`,
          {},
          (opts) => listCryptoKeyVersions(opts.projectId, opts.location, opts.keyRingName, opts.keyName)
        )
        .command(
          `restore <keyRingName> <keyName> <version>`,
          `Restores a crypto key version.`,
          {},
          (opts) => restoreCryptoKeyVersion(opts.projectId, opts.location, opts.keyRingName, opts.keyName, opts.version)
        );
    },
    () => {}
  )
  .options({
    location: {
      alias: 'l',
      default: 'global',
      global: true,
      requiresArg: true,
      type: 'string'
    },
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT,
      global: true,
      requiresArg: true,
      type: 'string'
    }
  })
  .example(`node $0 keyrings create "my-key-ring"`)
  .example(`node $0 keyrings list`)
  .example(`node $0 keyrings get-policy "my-key-ring"`)
  .example(`node $0 keyrings grant-access "my-key-ring" "user:developer@company.com" "roles/viewer"`)
  .example(`node $0 keyrings revoke-access "my-key-ring" "user:developer@company.com" "roles/viewer"`)
  .example(`node $0 create "my-key-ring" "my-key"`)
  .example(`node $0 list`)
  .example(`node $0 encrypt "my-key-ring" "my-key" ./resources/plaintext.txt ./resources/plaintext.txt.encrypted`)
  .example(`node $0 decrypt "my-key-ring" "my-key" ./resources/plaintext.txt.encrypted ./resources/plaintext.txt.decrypted`)
  .example(`node $0 set-primary "my-key-ring" "my-key" 123`)
  .example(`node $0 get-policy "my-key-ring" "my-key"`)
  .example(`node $0 grant-access "my-key-ring" "my-key" "user:developer@company.com" "roles/viewer"`)
  .example(`node $0 revoke-access "my-key-ring" "my-key" "user:developer@company.com" "roles/viewer"`)
  .example(`node $0 versions create "my-key-ring" "my-key"`)
  .example(`node $0 versions list "my-key-ring" "my-key"`)
  .example(`node $0 versions destroy "my-key-ring" "my-key" 123`)
  .example(`node $0 versions restore "my-key-ring" "my-key" 123`)
  .example(`node $0 versions disable "my-key-ring" "my-key" 123`)
  .example(`node $0 versions enable "my-key-ring" "my-key" 123`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/kms/docs`);

if (module === require.main) {
  cli.help().strict().argv;
}
