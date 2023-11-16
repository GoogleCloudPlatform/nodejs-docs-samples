// Copyright 2023 Google LLC
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

const {describe, it, before, after, beforeEach, afterEach} = require('mocha');
const {assert} = require('chai');
const crypto = require('crypto');
const {v4} = require('uuid');

const {KeyManagementServiceClient} = require('@google-cloud/kms');
const client = new KeyManagementServiceClient();

const projectId = process.env.GCLOUD_PROJECT;
const locationId = 'us-east1';
const keyRingId = v4();
const asymmetricDecryptKeyId = v4();
const asymmetricSignEcKeyId = v4();
const asymmetricSignRsaKeyId = v4();
const hsmKeyId = v4();
const symmetricKeyId = v4();
const hmacKeyId = v4();
const importJobId = v4();
const importedKeyId = v4();

const nodeMajorVersion = parseInt(process.version.match(/v?(\d+).*/)[1]);

const originalConsoleLog = console.log;

const waitForState = async (name, state) => {
  const sleep = w => new Promise(r => setTimeout(r, w));

  let [version] = await client.getCryptoKeyVersion({name});
  while (version.state !== state) {
    await sleep(100);
    [version] = await client.getCryptoKeyVersion({name});
  }
};

const waitForImportJobState = async (name, state) => {
  const sleep = w => new Promise(r => setTimeout(r, w));

  let [importJob] = await client.getImportJob({name});
  while (importJob.state !== state) {
    await sleep(100);
    [importJob] = await client.getImportJob({name});
  }
};

describe('Cloud KMS samples', () => {
  before(async () => {
    if (!projectId) {
      throw new Error('missing GCLOUD_PROJECT!');
    }

    await client.createKeyRing({
      parent: client.locationPath(projectId, locationId),
      keyRingId: keyRingId,
    });

    await client.createCryptoKey({
      parent: client.keyRingPath(projectId, locationId, keyRingId),
      cryptoKeyId: asymmetricDecryptKeyId,
      cryptoKey: {
        purpose: 'ASYMMETRIC_DECRYPT',
        versionTemplate: {
          algorithm: 'RSA_DECRYPT_OAEP_2048_SHA256',
        },
        labels: {
          foo: 'bar',
          zip: 'zap',
        },
      },
    });
    await waitForState(
      client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        asymmetricDecryptKeyId,
        1
      ),
      'ENABLED'
    );

    await client.createCryptoKey({
      parent: client.keyRingPath(projectId, locationId, keyRingId),
      cryptoKeyId: asymmetricSignEcKeyId,
      cryptoKey: {
        purpose: 'ASYMMETRIC_SIGN',
        versionTemplate: {
          algorithm: 'EC_SIGN_P256_SHA256',
        },
        labels: {
          foo: 'bar',
          zip: 'zap',
        },
      },
    });
    await waitForState(
      client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        asymmetricSignEcKeyId,
        1
      ),
      'ENABLED'
    );

    await client.createCryptoKey({
      parent: client.keyRingPath(projectId, locationId, keyRingId),
      cryptoKeyId: asymmetricSignRsaKeyId,
      cryptoKey: {
        purpose: 'ASYMMETRIC_SIGN',
        versionTemplate: {
          algorithm: 'RSA_SIGN_PSS_2048_SHA256',
        },
        labels: {
          foo: 'bar',
          zip: 'zap',
        },
      },
    });
    await waitForState(
      client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        asymmetricSignRsaKeyId,
        1
      ),
      'ENABLED'
    );

    await client.createCryptoKey({
      parent: client.keyRingPath(projectId, locationId, keyRingId),
      cryptoKeyId: hsmKeyId,
      cryptoKey: {
        purpose: 'ENCRYPT_DECRYPT',
        versionTemplate: {
          algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION',
          protectionLevel: 'HSM',
        },
        labels: {
          foo: 'bar',
          zip: 'zap',
        },
      },
    });
    await waitForState(
      client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        hsmKeyId,
        1
      ),
      'ENABLED'
    );

    await client.createCryptoKey({
      parent: client.keyRingPath(projectId, locationId, keyRingId),
      cryptoKeyId: symmetricKeyId,
      cryptoKey: {
        purpose: 'ENCRYPT_DECRYPT',
        versionTemplate: {
          algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION',
        },
        labels: {
          foo: 'bar',
          zip: 'zap',
        },
      },
    });
    await waitForState(
      client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        symmetricKeyId,
        1
      ),
      'ENABLED'
    );

    await client.createCryptoKey({
      parent: client.keyRingPath(projectId, locationId, keyRingId),
      cryptoKeyId: hmacKeyId,
      cryptoKey: {
        purpose: 'MAC',
        versionTemplate: {
          algorithm: 'HMAC_SHA256',
        },
        labels: {
          foo: 'bar',
          zip: 'zap',
        },
      },
    });
    await waitForState(
      client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        hmacKeyId,
        1
      ),
      'ENABLED'
    );
  });

  beforeEach(async () => {
    console.log = () => {};
  });

  afterEach(async () => {
    console.log = originalConsoleLog;
  });

  after(async () => {
    if (!projectId) {
      return;
    }

    const [keys] = await client.listCryptoKeys({
      parent: client.keyRingPath(projectId, locationId, keyRingId),
    });

    keys.forEach(async key => {
      if (key.rotationPeriod || key.nextRotationTime) {
        // Remove the rotation period if one exists
        await client.updateCryptoKey({
          cryptoKey: {
            name: key.name,
            rotationPeriod: null,
            nextRotationTime: null,
          },
          updateMask: {
            paths: ['rotation_period', 'next_rotation_time'],
          },
        });

        const [versions] = await client.listCryptoKeyVersions({
          parent: key.name,
          filter: 'state != DESTROYED AND state != DESTROY_SCHEDULED',
        });

        versions.forEach(async version => {
          await client.destroyCryptoKeyVersion({
            name: version.name,
          });
        });
      }
    });
  });

  it('creates asymmetric decryption keys', async () => {
    const sample = require('../createKeyAsymmetricDecrypt');
    const key = await sample.main(projectId, locationId, keyRingId, v4());
    assert.equal(key.purpose, 'ASYMMETRIC_DECRYPT');
    assert.equal(key.versionTemplate.algorithm, 'RSA_DECRYPT_OAEP_2048_SHA256');
  });

  it('creates asymmetric signing keys', async () => {
    const sample = require('../createKeyAsymmetricSign');
    const key = await sample.main(projectId, locationId, keyRingId, v4());
    assert.equal(key.purpose, 'ASYMMETRIC_SIGN');
    assert.equal(key.versionTemplate.algorithm, 'RSA_SIGN_PKCS1_2048_SHA256');
  });

  it('creates hsm keys', async () => {
    const sample = require('../createKeyHsm');
    const key = await sample.main(projectId, locationId, keyRingId, v4());
    assert.equal(key.versionTemplate.protectionLevel, 'HSM');
  });

  it('creates labeled keys', async () => {
    const sample = require('../createKeyLabels');
    const key = await sample.main(projectId, locationId, keyRingId, v4());
    assert.equal(key.labels.team, 'alpha');
    assert.equal(key.labels.cost_center, 'cc1234');
  });

  it('creates mac keys', async () => {
    const sample = require('../createKeyMac');
    const key = await sample.main(projectId, locationId, keyRingId, v4());
    assert.equal(key.purpose, 'MAC');
    assert.equal(key.versionTemplate.algorithm, 'HMAC_SHA256');
  });

  it('creates key rings', async () => {
    const sample = require('../createKeyRing');
    const keyRing = await sample.main(projectId, locationId, v4());
    assert.match(keyRing.name, new RegExp(`${locationId}`));
  });

  it('creates rotating keys', async () => {
    const sample = require('../createKeyRotationSchedule');
    const key = await sample.main(projectId, locationId, keyRingId, v4());
    assert.exists(key.rotationPeriod);
    assert.exists(key.nextRotationTime);
  });

  it('creates symmetric keys', async () => {
    const sample = require('../createKeySymmetricEncryptDecrypt');
    const key = await sample.main(projectId, locationId, keyRingId, v4());
    assert.equal(key.purpose, 'ENCRYPT_DECRYPT');
    assert.equal(key.versionTemplate.algorithm, 'GOOGLE_SYMMETRIC_ENCRYPTION');
  });

  it('creates key versions', async () => {
    const sample = require('../createKeyVersion');
    const version = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );
    assert.match(version.name, new RegExp(`${keyRingId}`));
  });

  it('decrypts asymmetric data', async () => {
    if (nodeMajorVersion < 12) {
      return;
    }

    const plaintext = 'my message';

    const versionName = client.cryptoKeyVersionPath(
      projectId,
      locationId,
      keyRingId,
      asymmetricDecryptKeyId,
      1
    );

    const [publicKey] = await client.getPublicKey({name: versionName});

    const ciphertextBuffer = crypto.publicEncrypt(
      {
        key: publicKey.pem,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(plaintext)
    );

    const sample = require('../decryptAsymmetric');
    const result = await sample.main(
      projectId,
      locationId,
      keyRingId,
      asymmetricDecryptKeyId,
      1,
      ciphertextBuffer
    );
    assert.equal(result, plaintext);
  });

  it('decrypts symmetric data', async () => {
    const plaintext = 'my message';

    const versionName = client.cryptoKeyVersionPath(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      1
    );

    const [encryptResponse] = await client.encrypt({
      name: versionName,
      plaintext: Buffer.from(plaintext),
    });

    const sample = require('../decryptSymmetric');
    const result = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      encryptResponse.ciphertext
    );
    assert.equal(result, plaintext);
  });

  it('destroys and restores key versions', async () => {
    const destroySample = require('../destroyKeyVersion');
    const destroyedVersion = await destroySample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      1
    );
    assert.equal(destroyedVersion.state, 'DESTROY_SCHEDULED');

    const restoreSample = require('../restoreKeyVersion');
    const restoredVersion = await restoreSample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      1
    );
    // Restored keys come back as disabled
    assert.equal(restoredVersion.state, 'DISABLED');
  });

  it('disables and enables key versions', async () => {
    const disableSample = require('../disableKeyVersion');
    const disabledVersion = await disableSample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      1
    );
    assert.equal(disabledVersion.state, 'DISABLED');

    const enableSample = require('../enableKeyVersion');
    const enabledVersion = await enableSample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      1
    );
    assert.equal(enabledVersion.state, 'ENABLED');
  });

  it('encrypts with asymmetric keys', async () => {
    if (nodeMajorVersion < 12) {
      return;
    }

    const plaintext = 'my message';

    const sample = require('../encryptAsymmetric');
    const ciphertextBuffer = await sample.main(
      projectId,
      locationId,
      keyRingId,
      asymmetricDecryptKeyId,
      1,
      Buffer.from(plaintext)
    );

    const [decryptResponse] = await client.asymmetricDecrypt({
      name: client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        asymmetricDecryptKeyId,
        1
      ),
      ciphertext: ciphertextBuffer,
    });

    assert.equal(decryptResponse.plaintext.toString('utf8'), plaintext);
  });

  it('encrypts with symmetric keys', async () => {
    const plaintext = 'my message';

    const sample = require('../encryptSymmetric');
    const ciphertextBuffer = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      Buffer.from(plaintext)
    );

    const [decryptResponse] = await client.decrypt({
      name: client.cryptoKeyPath(
        projectId,
        locationId,
        keyRingId,
        symmetricKeyId
      ),
      ciphertext: ciphertextBuffer,
    });

    assert.equal(decryptResponse.plaintext.toString('utf8'), plaintext);
  });

  it('generates random bytes', async () => {
    const sample = require('../generateRandomBytes');
    const result = await sample.main(projectId, locationId, 256);
    assert.equal(result.data.length, 256);
  });

  it('gets keys with labels', async () => {
    const sample = require('../getKeyLabels');
    const key = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );

    assert.equal(key.labels.foo, 'bar');
    assert.equal(key.labels.zip, 'zap');
  });

  it('gets version attestations', async () => {
    const sample = require('../getKeyVersionAttestation');
    const attestation = await sample.main(
      projectId,
      locationId,
      keyRingId,
      hsmKeyId,
      1
    );

    assert.exists(attestation);
  });

  it('errors on bad attestations', async () => {
    const sample = require('../getKeyVersionAttestation');
    sample
      .main(projectId, locationId, keyRingId, symmetricKeyId, 1)
      .then(() => {
        throw new Error('expected error');
      })
      .catch(err => {
        assert.match(err, new RegExp('no attestation'));
      });
  });

  it('gets public keys', async () => {
    const sample = require('../getPublicKey');
    const publicKey = await sample.main(
      projectId,
      locationId,
      keyRingId,
      asymmetricDecryptKeyId,
      1
    );

    assert.exists(publicKey);
  });

  it('adds IAM members', async () => {
    const sample = require('../iamAddMember');
    const policy = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      'group:test@google.com'
    );

    let binding;
    for (const b of policy.bindings) {
      if (b.role === 'roles/cloudkms.cryptoKeyEncrypterDecrypter') {
        binding = b;
        break;
      }
    }

    assert.exists(binding);
    assert.oneOf('group:test@google.com', binding.members);
  });

  it('get IAM policies', async () => {
    const sample = require('../iamGetPolicy');
    const policy = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );

    assert.exists(policy);
  });

  it('removes IAM members', async () => {
    const resourceName = client.cryptoKeyPath(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );

    const [policy] = await client.getIamPolicy({
      resource: resourceName,
    });

    policy.bindings.push({
      role: 'roles/cloudkms.publicKeyViewer',
      members: ['group:test@google.com'],
    });

    policy.bindings.push({
      role: 'roles/cloudkms.cryptoKeyEncrypter',
      members: ['group:test@google.com'],
    });

    await client.setIamPolicy({
      resource: resourceName,
      policy: policy,
    });

    const sample = require('../iamRemoveMember');
    const updatedPolicy = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      'group:test@google.com'
    );

    let binding;
    for (const b of updatedPolicy.bindings) {
      if (b.role === 'roles/cloudkms.cryptoKeyEncrypterDecrypter') {
        binding = b;
        break;
      }
    }

    assert.notExists(binding);
  });

  it('quickstarts', async () => {
    const sample = require('../quickstart');
    const keyRings = await sample.main(projectId, locationId);

    assert.isNotEmpty(keyRings);
  });

  it('signs with asymmetric keys', async () => {
    if (nodeMajorVersion < 12) {
      return;
    }

    const message = 'my message';

    const sample = require('../signAsymmetric');
    const signatureBuffer = await sample.main(
      projectId,
      locationId,
      keyRingId,
      asymmetricSignEcKeyId,
      1,
      message
    );

    const [publicKey] = await client.getPublicKey({
      name: client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        asymmetricSignEcKeyId,
        1
      ),
    });

    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    verify.end();

    const verified = verify.verify(publicKey.pem, signatureBuffer);
    assert.isTrue(verified);
  });

  it('signs with mac keys', async () => {
    const data = 'my data';

    const sample = require('../signMac');
    const result = await sample.main(
      projectId,
      locationId,
      keyRingId,
      hmacKeyId,
      1,
      Buffer.from(data)
    );

    const [verifyResponse] = await client.macVerify({
      name: client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        hmacKeyId,
        1
      ),
      data: Buffer.from(data),
      mac: result.mac,
    });

    assert.isTrue(verifyResponse.success);
  });

  it('adds rotation schedules', async () => {
    const sample = require('../updateKeyAddRotation');
    const key = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );
    assert.exists(key.rotationSchedule);
    assert.exists(key.nextRotationTime);
  });

  it('removes labels', async () => {
    const sample = require('../updateKeyRemoveLabels');
    const key = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );
    assert.isEmpty(key.labels);
  });

  it('removes rotation schedules', async () => {
    const sample = require('../updateKeyRemoveRotation');
    const key = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );
    assert.notExists(key.rotationSchedule);
    assert.notExists(key.nextRotationTime);
  });

  it('sets primary version', async () => {
    const sample = require('../updateKeySetPrimary');
    const key = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId,
      1
    );
    assert.exists(key.primary);
  });

  it('updates labels', async () => {
    const sample = require('../updateKeyUpdateLabels');
    const key = await sample.main(
      projectId,
      locationId,
      keyRingId,
      symmetricKeyId
    );
    assert.equal(key.labels.new_label, 'new_value');
  });

  it('verifies with asymmetric EC keys', async () => {
    if (nodeMajorVersion < 12) {
      return;
    }

    const message = 'my message';

    const digest = crypto.createHash('sha256');
    digest.update(message);

    const [signResponse] = await client.asymmetricSign({
      name: client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        asymmetricSignEcKeyId,
        1
      ),
      digest: {
        sha256: digest.digest(),
      },
    });

    const sample = require('../verifyAsymmetricEc');
    const verified = await sample.main(
      projectId,
      locationId,
      keyRingId,
      asymmetricSignEcKeyId,
      1,
      message,
      signResponse.signature
    );

    assert.isTrue(verified);
  });

  it('verifies with asymmetric RSA keys', async () => {
    if (nodeMajorVersion < 12) {
      return;
    }

    const message = 'my message';

    const digest = crypto.createHash('sha256');
    digest.update(message);

    const [signResponse] = await client.asymmetricSign({
      name: client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        asymmetricSignRsaKeyId,
        1
      ),
      digest: {
        sha256: digest.digest(),
      },
    });

    const sample = require('../verifyAsymmetricRsa');
    const verified = await sample.main(
      projectId,
      locationId,
      keyRingId,
      asymmetricSignRsaKeyId,
      1,
      message,
      signResponse.signature
    );

    assert.isTrue(verified);
  });

  it('verifies with mac keys', async () => {
    const data = 'my data';

    const [signResponse] = await client.macSign({
      name: client.cryptoKeyVersionPath(
        projectId,
        locationId,
        keyRingId,
        hmacKeyId,
        1
      ),
      data: Buffer.from(data),
    });

    const sample = require('../verifyMac');
    const result = await sample.main(
      projectId,
      locationId,
      keyRingId,
      hmacKeyId,
      1,
      Buffer.from(data),
      signResponse.mac
    );

    assert.isTrue(result.success);
  });

  it('imports a key version (end to end)', async () => {
    const createKeySample = require('../createKeyForImport');
    await createKeySample.main(projectId, locationId, keyRingId, importedKeyId);

    const createImportJobSample = require('../createImportJob');
    const createImportJobResult = await createImportJobSample.main(
      projectId,
      locationId,
      keyRingId,
      importJobId
    );

    await waitForImportJobState(createImportJobResult.name, 'ACTIVE');
    const checkImportJobStateSample = require('../checkStateImportJob');
    const checkImportJobStateResult = await checkImportJobStateSample.main(
      projectId,
      locationId,
      keyRingId,
      importJobId
    );
    assert.equal(checkImportJobStateResult.state, 'ACTIVE');

    const importManuallyWrappedKeySample = require('../importManuallyWrappedKey');
    const importManuallyWrappedKeyResult =
      await importManuallyWrappedKeySample.main(
        projectId,
        locationId,
        keyRingId,
        importedKeyId,
        importJobId
      );

    await waitForState(importManuallyWrappedKeyResult.name, 'ENABLED');
    const checkKeyVersionStateSample = require('../checkStateImportedKey');
    const checkKeyVersionStateResult = await checkKeyVersionStateSample.main(
      projectId,
      locationId,
      keyRingId,
      importedKeyId,
      '1'
    );
    assert.equal(checkKeyVersionStateResult.state, 'ENABLED');
  });
});
