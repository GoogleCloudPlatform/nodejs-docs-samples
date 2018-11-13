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

const Buffer = require('safe-buffer').Buffer;

function createKeyRing(projectId, locationId, keyRingId) {
  // [START kms_create_keyring]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the new key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the new key ring, e.g. "my-new-key-ring"
  // const keyRingId = 'my-new-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${locationId}`,
      // This will be a path parameter in the request URL
      keyRingId: keyRingId,
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.create(request, (err, response) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Key ring ${response.data.name} created.`);
    });
  });
  // [END kms_create_keyring]
}

function listKeyRings(projectId, locationId) {
  // [START kms_list_keyrings]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location from which to list key rings, e.g. "global"
  // const locationId = 'global';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${locationId}`,
    };

    // Lists key rings
    cloudkms.projects.locations.keyRings.list(request, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      const keyRings = result.data.keyRings || [];

      if (keyRings.length) {
        keyRings.forEach(keyRing => {
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

function getKeyRing(projectId, locationId, keyRingId) {
  // [START kms_get_keyring]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
    };

    // Gets a key ring
    cloudkms.projects.locations.keyRings.get(request, (err, response) => {
      if (err) {
        console.log(err);
        return;
      }

      const keyRing = response.data;
      console.log(`Name: ${keyRing.name}`);
      console.log(`Created: ${new Date(keyRing.createTime)}`);
    });
  });
  // [END kms_get_keyring]
}

function getKeyRingIamPolicy(projectId, locationId, keyRingId) {
  // [START kms_get_keyring_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
    };

    // Gets the IAM policy of a key ring
    cloudkms.projects.locations.keyRings.getIamPolicy(
      request,
      (err, policy) => {
        if (err) {
          console.log(err);
          return;
        }

        if (policy.data.bindings) {
          policy.data.bindings.forEach(binding => {
            if (binding.members && binding.members.length) {
              console.log(`${binding.role}:`);
              binding.members.forEach(member => {
                console.log(`  ${member}`);
              });
            }
          });
        } else {
          console.log(`Policy for key ring ${keyRingId} is empty.`);
        }
      }
    );
  });
  // [END kms_get_keyring_policy]
}

function addMemberToKeyRingPolicy(
  projectId,
  locationId,
  keyRingId,
  member,
  role
) {
  // [START kms_add_member_to_keyring_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

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
      resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
    };

    // Gets the IAM policy of a key ring
    cloudkms.projects.locations.keyRings.getIamPolicy(
      request,
      (err, policy) => {
        if (err) {
          console.log(err);
          return;
        }

        policy = Object.assign({bindings: []}, policy.data);

        const index = policy.bindings.findIndex(
          binding => binding.role === role
        );

        // Add the role/member combo to the policy
        const binding = Object.assign(
          {
            role: role,
            members: [],
          },
          policy.bindings[index]
        );
        if (index === -1) {
          policy.bindings.push(binding);
        }
        if (!binding.members.includes(member)) {
          binding.members.push(member);
        }

        request = {
          // This will be a path parameter in the request URL
          resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
          // This will be the request body
          resource: {
            policy: policy,
          },
        };

        // Adds the member/role combo to the policy of the key ring
        cloudkms.projects.locations.keyRings.setIamPolicy(
          request,
          (err, policy) => {
            if (err) {
              console.log(err);
              return;
            }

            console.log(
              `${member}/${role} combo added to policy for key ring ${keyRingId}.`
            );
            if (policy.data.bindings) {
              policy.data.bindings.forEach(binding => {
                if (binding.members && binding.members.length) {
                  console.log(`${binding.role}:`);
                  binding.members.forEach(member => {
                    console.log(`  ${member}`);
                  });
                }
              });
            } else {
              console.log(`Policy for key ring ${keyRingId} is empty.`);
            }
          }
        );
      }
    );
  });
  // [END kms_add_member_to_keyring_policy]
}

function removeMemberFromKeyRingPolicy(
  projectId,
  locationId,
  keyRingId,
  member,
  role
) {
  // [START kms_remove_member_from_keyring_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

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
      resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
    };

    // Gets the IAM policy of a key ring
    cloudkms.projects.locations.keyRings.getIamPolicy(
      request,
      (err, policy) => {
        if (err) {
          console.log(err);
          return;
        }

        policy = Object.assign({bindings: []}, policy.data);

        let index = policy.bindings.findIndex(binding => binding.role === role);

        const binding = Object.assign(
          {
            role: role,
            members: [],
          },
          policy.bindings[index]
        );
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
          resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
          // This will be the request body
          resource: {
            policy: policy,
          },
        };

        // Removes the role/member combo from the policy of the key ring
        cloudkms.projects.locations.keyRings.setIamPolicy(
          request,
          (err, response) => {
            if (err) {
              console.log(err);
              return;
            }

            console.log(
              `${member}/${role} combo removed from policy for key ring ${keyRingId}.`
            );
            const policy = response.data;
            if (policy.bindings) {
              policy.bindings.forEach(binding => {
                if (binding.members && binding.members.length) {
                  console.log(`${binding.role}:`);
                  binding.members.forEach(member => {
                    console.log(`  ${member}`);
                  });
                }
              });
            } else {
              console.log(`Policy for key ring ${keyRingId} is empty.`);
            }
          }
        );
      }
    );
  });
  // [END kms_remove_member_from_keyring_policy]
}

function createCryptoKey(projectId, locationId, keyRingId, cryptoKeyId) {
  // [START kms_create_cryptokey]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the new crypto key's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the new crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name for the new crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
      // This will be a path parameter in the request URL
      cryptoKeyId: cryptoKeyId,

      resource: {
        // This will allow the API access to the key for encryption and decryption
        purpose: 'ENCRYPT_DECRYPT',
      },
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.cryptoKeys.create(
      request,
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }

        const cryptoKey = response.data;
        console.log(`Key ${cryptoKey.name} created.`);
      }
    );
  });
  // [END kms_create_cryptokey]
}

function listCryptoKeys(projectId, locationId, keyRingId) {
  // [START kms_list_cryptokeys]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the key ring from which to list crypto keys, e.g. "global"
  // const locationId = 'global';

  // The name of the key ring from which to list crypto keys, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`,
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.cryptoKeys.list(
      request,
      (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        const cryptoKeys = result.data.cryptoKeys || [];

        if (cryptoKeys.length) {
          cryptoKeys.forEach(cryptoKey => {
            console.log(`${cryptoKey.name}:`);
            console.log(`  Created: ${new Date(cryptoKey.createTime)}`);
            console.log(`  Purpose: ${cryptoKey.purpose}`);
            console.log(`  Primary: ${cryptoKey.primary.name}`);
            console.log(`    State: ${cryptoKey.primary.state}`);
            console.log(
              `    Created: ${new Date(cryptoKey.primary.createTime)}`
            );
          });
        } else {
          console.log('No crypto keys found.');
        }
      }
    );
  });
  // [END kms_list_cryptokeys]
}

function encrypt(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  plaintextFileName,
  ciphertextFileName
) {
  // [START kms_encrypt]
  const fs = require('fs');

  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

  // The path to the file to encrypt, e.g. "./path/to/plaintext.txt"
  // const plaintextFileName = './path/to/plaintext.txt';

  // The path where the encrypted file should be written, e.g. "./path/to/plaintext.txt.encrypted"
  // const ciphertextFileName = './path/to/plaintext.txt.encrypted';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    // Reads the file to be encrypted
    fs.readFile(plaintextFileName, (err, contentsBuffer) => {
      if (err) {
        console.log(err);
        return;
      }

      const request = {
        // This will be a path parameter in the request URL
        name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
        // This will be the request body
        resource: {
          plaintext: contentsBuffer.toString('base64'),
        },
      };

      // Encrypts the file using the specified crypto key
      cloudkms.projects.locations.keyRings.cryptoKeys.encrypt(
        request,
        (err, response) => {
          if (err) {
            console.log(err);
            return;
          }

          // Writes the encrypted file to disk
          const result = response.data;
          fs.writeFile(
            ciphertextFileName,
            Buffer.from(result.ciphertext, 'base64'),
            err => {
              if (err) {
                console.log(err);
                return;
              }

              console.log(
                `Encrypted ${plaintextFileName} using ${result.name}.`
              );
              console.log(`Result saved to ${ciphertextFileName}.`);
            }
          );
        }
      );
    });
  });
  // [END kms_encrypt]
}

function decrypt(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  ciphertextFileName,
  plaintextFileName
) {
  // [START kms_decrypt]
  const fs = require('fs');

  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

  // The path to the file to decrypt, e.g. "./path/to/plaintext.txt.encrypted"
  // const ciphertextFileName = './path/to/plaintext.txt.encrypted';

  // The path where the decrypted file should be written, e.g. "./path/to/plaintext.txt.decrypted"
  // const plaintextFileName = './path/to/plaintext.txt.decrypted';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    // Reads the file to be decrypted
    fs.readFile(ciphertextFileName, (err, contentsBuffer) => {
      if (err) {
        console.log(err);
        return;
      }

      const request = {
        // This will be a path parameter in the request URL
        name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
        // This will be the request body
        resource: {
          ciphertext: contentsBuffer.toString('base64'),
        },
      };

      // Dencrypts the file using the specified crypto key
      cloudkms.projects.locations.keyRings.cryptoKeys.decrypt(
        request,
        (err, response) => {
          if (err) {
            console.log(err);
            return;
          }

          // Writes the dencrypted file to disk
          const result = response.data;
          fs.writeFile(
            plaintextFileName,
            Buffer.from(result.plaintext, 'base64'),
            err => {
              if (err) {
                console.log(err);
                return;
              }

              console.log(
                `Decrypted ${ciphertextFileName}, result saved to ${plaintextFileName}.`
              );
            }
          );
        }
      );
    });
  });
  // [END kms_decrypt]
}

function getCryptoKey(projectId, locationId, keyRingId, cryptoKeyId) {
  // [START kms_get_cryptokey]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
    };

    // Gets a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.get(
      request,
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }

        const cryptoKey = response.data;
        console.log(`Name: ${cryptoKey.name}:`);
        console.log(`Created: ${new Date(cryptoKey.createTime)}`);
        console.log(`Purpose: ${cryptoKey.purpose}`);
        console.log(`Primary: ${cryptoKey.primary.name}`);
        console.log(`  State: ${cryptoKey.primary.state}`);
        console.log(`  Created: ${new Date(cryptoKey.primary.createTime)}`);
      }
    );
  });
  // [END kms_get_cryptokey]
}

function setPrimaryCryptoKeyVersion(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  version
) {
  // [START kms_set_cryptokey_primary_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

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
      name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
      // This will be the request body
      resource: {
        cryptoKeyVersionId: `${version}`,
      },
    };

    // Sets a crypto key's primary version
    cloudkms.projects.locations.keyRings.cryptoKeys.updatePrimaryVersion(
      request,
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }

        const cryptoKey = response.data;
        console.log(
          `Set ${version} as primary version for crypto key ${cryptoKeyId}.\n`
        );
        console.log(`Name: ${cryptoKey.name}:`);
        console.log(`Created: ${new Date(cryptoKey.createTime)}`);
        console.log(`Purpose: ${cryptoKey.purpose}`);
        console.log(`Primary: ${cryptoKey.primary.name}`);
        console.log(`  State: ${cryptoKey.primary.state}`);
        console.log(`  Created: ${new Date(cryptoKey.primary.createTime)}`);
      }
    );
  });
  // [END kms_set_cryptokey_primary_version]
}

function getCryptoKeyIamPolicy(projectId, locationId, keyRingId, cryptoKeyId) {
  // [START kms_get_cryptokey_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
    };

    // Gets the IAM policy of a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.getIamPolicy(
      request,
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(response);
        const policy = response.data;
        if (policy.bindings) {
          policy.bindings.forEach(binding => {
            if (binding.members && binding.members.length) {
              console.log(`${binding.role}:`);
              binding.members.forEach(member => {
                console.log(`  ${member}`);
              });
            }
          });
        } else {
          console.log(`Policy for crypto key ${cryptoKeyId} is empty.`);
        }
      }
    );
  });
  // [END kms_get_cryptokey_policy]
}

function addMemberToCryptoKeyPolicy(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  member,
  role
) {
  // [START kms_add_member_to_cryptokey_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring
  // const locationId = 'my-key-ring-location';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

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
      resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
    };

    // Gets the IAM policy of a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.getIamPolicy(
      request,
      (err, getResponse) => {
        if (err) {
          console.log(err);
          return;
        }

        let policy = Object.assign({bindings: []}, getResponse.data);

        const index = policy.bindings.findIndex(
          binding => binding.role === role
        );

        // Add the role/member combo to the policy
        const binding = Object.assign(
          {
            role: role,
            members: [],
          },
          policy.bindings[index]
        );
        if (index === -1) {
          policy.bindings.push(binding);
        }
        if (!binding.members.includes(member)) {
          binding.members.push(member);
        }

        request = {
          // This will be a path parameter in the request URL
          resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
          // This will be the request body
          resource: {
            policy: policy,
          },
        };

        // Adds the member/role combo to the policy of the crypto key
        cloudkms.projects.locations.keyRings.cryptoKeys.setIamPolicy(
          request,
          (err, setResponse) => {
            if (err) {
              console.log(err);
              return;
            }

            policy = setResponse.data;
            console.log(
              `${member}/${role} combo added to policy for crypto key ${cryptoKeyId}.`
            );
            if (policy.bindings) {
              policy.bindings.forEach(binding => {
                if (binding.members && binding.members.length) {
                  console.log(`${binding.role}:`);
                  binding.members.forEach(member => {
                    console.log(`  ${member}`);
                  });
                }
              });
            } else {
              console.log(`Policy for crypto key ${cryptoKeyId} is empty.`);
            }
          }
        );
      }
    );
  });
  // [END kms_add_member_to_cryptokey_policy]
}

function removeMemberFromCryptoKeyPolicy(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  member,
  role
) {
  // [START kms_remove_member_from_cryptokey_policy]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

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
      resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
    };

    // Gets the IAM policy of a crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.getIamPolicy(
      request,
      (err, getResponse) => {
        if (err) {
          console.log(err);
          return;
        }

        let policy = Object.assign({bindings: []}, getResponse.data);

        let index = policy.bindings.findIndex(binding => binding.role === role);

        const binding = Object.assign(
          {
            role: role,
            members: [],
          },
          policy.bindings[index]
        );
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
          resource_: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
          // This will be the request body
          resource: {
            policy: policy,
          },
        };

        console.log(JSON.stringify(request, null, 2));

        // Removes the member/role combo from the policy of the crypto key
        cloudkms.projects.locations.keyRings.cryptoKeys.setIamPolicy(
          request,
          (err, setResponse) => {
            if (err) {
              console.log(err);
              return;
            }

            console.log(
              `${member}/${role} combo removed from policy for crypto key ${cryptoKeyId}.`
            );
            const policy = setResponse.data;
            if (policy.bindings) {
              policy.bindings.forEach(binding => {
                if (binding.members && binding.members.length) {
                  console.log(`${binding.role}:`);
                  binding.members.forEach(member => {
                    console.log(`  ${member}`);
                  });
                }
              });
            } else {
              console.log(`Policy for crypto key ${cryptoKeyId} is empty.`);
            }
          }
        );
      }
    );
  });
  // [END kms_remove_member_from_cryptokey_policy]
}

function createCryptoKeyVersion(projectId, locationId, keyRingId, cryptoKeyId) {
  // [START kms_create_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
    };

    // Creates a new crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.create(
      request,
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Crypto key version ${response.data.name} created.`);
      }
    );
  });
  // [END kms_create_cryptokey_version]
}

function listCryptoKeyVersions(projectId, locationId, keyRingId, cryptoKeyId) {
  // [START kms_list_cryptokey_versions]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the crypto key from which to list versions, e.g. "my-key"
  // const cryptoKeyId = 'my-key-ring';

  // Builds and authorizes a Cloud KMS client
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      return;
    }

    const request = {
      // This will be a path parameter in the request URL
      parent: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}`,
    };

    // Creates a new key ring
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.list(
      request,
      (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        const cryptoKeyVersions = result.data.cryptoKeyVersions || [];

        if (cryptoKeyVersions.length) {
          cryptoKeyVersions.forEach(version => {
            console.log(`${version.name}:`);
            console.log(`  Created: ${new Date(version.createTime)}`);
            console.log(`  State: ${version.state}`);
          });
        } else {
          console.log('No crypto key versions found.');
        }
      }
    );
  });
  // [END kms_list_cryptokey_versions]
}

function destroyCryptoKeyVersion(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  version
) {
  // [START kms_destroy_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

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
      name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}/cryptoKeyVersions/${version}`,
    };

    // Destroys a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.destroy(
      request,
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Crypto key version ${response.data.name} destroyed.`);
      }
    );
  });
  // [END kms_destroy_cryptokey_version]
}

function restoreCryptoKeyVersion(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  version
) {
  // [START kms_restore_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

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
      name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}/cryptoKeyVersions/${version}`,
    };

    // Restores a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.restore(
      request,
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Crypto key version ${response.data.name} restored.`);
      }
    );
  });
  // [END kms_restore_cryptokey_version]
}

function enableCryptoKeyVersion(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  version
) {
  // [START kms_enable_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

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
      name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}/cryptoKeyVersions/${version}`,
    };

    // Gets a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.get(
      request,
      (err, getResponse) => {
        if (err) {
          console.log(err);
          return;
        }

        const cryptoKeyVersion = getResponse.data;
        cryptoKeyVersion.state = 'ENABLED';

        request = {
          // This will be a path parameter in the request URL
          name: request.name,
          // This will be a query parameter in the request URL
          updateMask: 'state',
          // This will be the request body
          resource: cryptoKeyVersion,
        };

        // Enables a crypto key version
        cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.patch(
          request,
          (err, patchResponse) => {
            if (err) {
              console.log(err);
              return;
            }

            console.log(
              `Crypto key version ${patchResponse.data.name} enabled.`
            );
          }
        );
      }
    );
  });
  // [END kms_enable_cryptokey_version]
}

function disableCryptoKeyVersion(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  version
) {
  // [START kms_disable_cryptokey_version]
  // Your Google Cloud Platform project ID
  // const projectId = 'YOUR_PROJECT_ID';

  // The location of the crypto key versions's key ring, e.g. "global"
  // const locationId = 'global';

  // The name of the crypto key version's key ring, e.g. "my-key-ring"
  // const keyRingId = 'my-key-ring';

  // The name of the version's crypto key, e.g. "my-key"
  // const cryptoKeyId = 'my-key';

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
      name: `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${cryptoKeyId}/cryptoKeyVersions/${version}`,
    };

    // Gets a crypto key version
    cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.get(
      request,
      (err, getResponse) => {
        if (err) {
          console.log(err);
          return;
        }

        const cryptoKeyVersion = getResponse.data;
        cryptoKeyVersion.state = 'DISABLED';

        request = {
          // This will be a path parameter in the request URL
          name: request.name,
          // This will be a query parameter in the request URL
          updateMask: 'state',
          // This will be the request body
          resource: cryptoKeyVersion,
        };

        // Disables a crypto key version
        cloudkms.projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.patch(
          request,
          (err, patchResponse) => {
            if (err) {
              console.log(err);
              return;
            }

            console.log(
              `Crypto key version ${patchResponse.data.name} disabled.`
            );
          }
        );
      }
    );
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

function buildAndAuthorizeService(callback) {
  // Imports the Google APIs client library
  const {google} = require('googleapis');

  // Acquires credentials
  google.auth.getApplicationDefault((err, authClient) => {
    if (err) {
      callback(err);
      return;
    }

    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform',
      ]);
    }

    // Instantiates an authorized client
    const cloudkms = google.cloudkms({
      version: 'v1',
      auth: authClient,
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
  .command(`create <keyRing> <cryptoKey>`, `Creates a crypto key.`, {}, opts =>
    createCryptoKey(opts.projectId, opts.location, opts.keyRing, opts.cryptoKey)
  )
  .command(
    `decrypt <keyRing> <cryptoKey> <ciphertextFileName> <plaintextFileName>`,
    `Decrypts a file.`,
    {},
    opts =>
      decrypt(
        opts.projectId,
        opts.location,
        opts.keyRing,
        opts.cryptoKey,
        opts.ciphertextFileName,
        opts.plaintextFileName
      )
  )
  .command(
    `encrypt <keyRing> <cryptoKey> <plaintextFileName> <ciphertextFileName>`,
    `Encrypts a file.`,
    {},
    opts =>
      encrypt(
        opts.projectId,
        opts.location,
        opts.keyRing,
        opts.cryptoKey,
        opts.plaintextFileName,
        opts.ciphertextFileName
      )
  )
  .command(`get <keyRing> <cryptoKey>`, `Gets a crypto key.`, {}, opts =>
    getCryptoKey(opts.projectId, opts.location, opts.keyRing, opts.cryptoKey)
  )
  .command(
    `get-policy <keyRing> <cryptoKey>`,
    `Gets a crypto key's IAM policy.`,
    {},
    opts =>
      getCryptoKeyIamPolicy(
        opts.projectId,
        opts.location,
        opts.keyRing,
        opts.cryptoKey
      )
  )
  .command(
    `grant-access <keyRing> <cryptoKey> <member> <role>`,
    `Adds a members to a crypto key's IAM policy.`,
    {},
    opts =>
      addMemberToCryptoKeyPolicy(
        opts.projectId,
        opts.location,
        opts.keyRing,
        opts.cryptoKey,
        opts.member,
        opts.role
      )
  )
  .command(
    `keyrings <command>`,
    `Access key rings subcommands.`,
    yargs => {
      yargs
        .command(`create <keyRing>`, `Creates a key ring.`, {}, opts =>
          createKeyRing(opts.projectId, opts.location, opts.keyRing)
        )
        .command(`list`, `Lists key rings.`, {}, opts =>
          listKeyRings(opts.projectId, opts.location)
        )
        .command(`get <keyRing>`, `Gets a key ring.`, {}, opts =>
          getKeyRing(opts.projectId, opts.location, opts.keyRing)
        )
        .command(
          `get-policy <keyRing>`,
          `Gets a key ring's IAM policy.`,
          {},
          opts =>
            getKeyRingIamPolicy(opts.projectId, opts.location, opts.keyRing)
        )
        .command(
          `grant-access <keyRing> <member> <role>`,
          `Adds a members to a key ring's IAM policy.`,
          {},
          opts =>
            addMemberToKeyRingPolicy(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.member,
              opts.role
            )
        )
        .command(
          `revoke-access <keyRing> <member> <role>`,
          `Removes a member from a key ring's IAM policy.`,
          {},
          opts =>
            removeMemberFromKeyRingPolicy(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.member,
              opts.role
            )
        );
    },
    () => {}
  )
  .command(`list <keyRing>`, `Lists crypto keys.`, {}, opts =>
    listCryptoKeys(opts.projectId, opts.location, opts.keyRing)
  )
  .command(
    `revoke-access <keyRing> <cryptoKey> <member> <role>`,
    `Removes a member from a crypto key's IAM policy.`,
    {},
    opts =>
      removeMemberFromCryptoKeyPolicy(
        opts.projectId,
        opts.location,
        opts.keyRing,
        opts.cryptoKey,
        opts.member,
        opts.role
      )
  )
  .command(
    `set-primary <keyRing> <cryptoKey> <keyVersion>`,
    `Sets a crypto key's primary version.`,
    {},
    opts =>
      setPrimaryCryptoKeyVersion(
        opts.projectId,
        opts.location,
        opts.keyRing,
        opts.cryptoKey,
        opts.keyVersion
      )
  )
  .command(
    `versions <command>`,
    `Access crypto key versions subcommands.`,
    yargs => {
      yargs
        .command(
          `create <keyRing> <cryptoKey>`,
          `Creates a crypto key version.`,
          {},
          opts =>
            createCryptoKeyVersion(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.cryptoKey
            )
        )
        .command(
          `destroy <keyRing> <cryptoKey> <keyVersion>`,
          `Destroys a crypto key version.`,
          {},
          opts =>
            destroyCryptoKeyVersion(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.cryptoKey,
              opts.keyVersion
            )
        )
        .command(
          `disable <keyRing> <cryptoKey> <keyVersion>`,
          `Disables a crypto key version.`,
          {},
          opts =>
            disableCryptoKeyVersion(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.cryptoKey,
              opts.keyVersion
            )
        )
        .command(
          `enable <keyRing> <cryptoKey> <keyVersion>`,
          `Enables a crypto key version.`,
          {},
          opts =>
            enableCryptoKeyVersion(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.cryptoKey,
              opts.keyVersion
            )
        )
        .command(
          `list <keyRing> <cryptoKey>`,
          `Lists crypto key versions.`,
          {},
          opts =>
            listCryptoKeyVersions(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.cryptoKey
            )
        )
        .command(
          `restore <keyRing> <cryptoKey> <keyVersion>`,
          `Restores a crypto key version.`,
          {},
          opts =>
            restoreCryptoKeyVersion(
              opts.projectId,
              opts.location,
              opts.keyRing,
              opts.cryptoKey,
              opts.keyVersion
            )
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
      type: 'string',
    },
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT,
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example(`node $0 keyrings create "my-key-ring"`)
  .example(`node $0 keyrings list`)
  .example(`node $0 keyrings get-policy "my-key-ring"`)
  .example(
    `node $0 keyrings grant-access "my-key-ring" "user:developer@company.com" "roles/viewer"`
  )
  .example(
    `node $0 keyrings revoke-access "my-key-ring" "user:developer@company.com" "roles/viewer"`
  )
  .example(`node $0 create "my-key-ring" "my-key"`)
  .example(`node $0 list`)
  .example(
    `node $0 encrypt "my-key-ring" "my-key" ./resources/plaintext.txt ./resources/plaintext.txt.encrypted`
  )
  .example(
    `node $0 decrypt "my-key-ring" "my-key" ./resources/plaintext.txt.encrypted ./resources/plaintext.txt.decrypted`
  )
  .example(`node $0 set-primary "my-key-ring" "my-key" 123`)
  .example(`node $0 get-policy "my-key-ring" "my-key"`)
  .example(
    `node $0 grant-access "my-key-ring" "my-key" "user:developer@company.com" "roles/viewer"`
  )
  .example(
    `node $0 revoke-access "my-key-ring" "my-key" "user:developer@company.com" "roles/viewer"`
  )
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
  cli.help().strict().argv; // eslint-disable-line
}
