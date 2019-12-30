// Copyright 2018 Google LLC
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

const fs = require(`fs`);
const path = require(`path`);
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');
const {promisify} = require('util');
const uuidv4 = require(`uuid/v4`);
const unlink = promisify(fs.unlink);

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const keyRingName = `test-ring-${uuidv4()}`;
const keyNameOne = `test-key-${uuidv4()}`;
const member = `allAuthenticatedUsers`;
const role = `roles/viewer`;
const projectId = process.env.GCLOUD_PROJECT;
const plaintext = path.join(__dirname, `../resources/plaintext.txt`);
const ciphertext = path.join(__dirname, `../resources/plaintext.txt.encrypted`);
const decrypted = path.join(__dirname, `../resources/plaintext.txt.decrypted`);

const unspecifiedKeyRingName = `projects/${projectId}/locations/global/keyRings/`;
const formattedKeyRingName = `projects/${projectId}/locations/global/keyRings/${keyRingName}`;
const formattedKeyName = `${formattedKeyRingName}/cryptoKeys/${keyNameOne}`;

const nodeMajorVersion = parseInt(process.version.match(/v?(\d+).*/)[1]);

describe('kms sample tests', () => {
  before(async () => {
    try {
      await unlink(ciphertext);
      await unlink(decrypted);
    } catch (e) {
      // ignore exceptions
    }
  });

  after(async () => {
    try {
      await unlink(ciphertext);
      await unlink(decrypted);
    } catch (e) {
      // ignore exceptions
    }
  });

  it('should list key rings', async () => {
    const output = execSync(`node quickstart.js "${projectId}"`);
    assert.match(output, /Key rings:/);
    assert.match(output, /\/locations\/global\/keyRings\//);
  });

  it(`should create a key ring`, async () => {
    const output = execSync(
      `node createKeyring.js "${projectId}" "${keyRingName}"`
    );
    if (!output.includes(`KeyRing ${formattedKeyRingName} already exists`)) {
      assert.match(
        output,
        new RegExp(`Key ring ${formattedKeyRingName} created.`)
      );
    }
  });

  it(`should list key rings`, async () => {
    const output = execSync(`node listKeyrings.js ${projectId}`);
    assert.match(output, new RegExp(unspecifiedKeyRingName));
  });

  it(`should get a key ring`, async () => {
    const output = execSync(`node getKeyring ${projectId} ${keyRingName}`);
    assert.match(output, new RegExp(`Name: ${formattedKeyRingName}`));
    assert.match(output, /Created: /);
  });

  it(`should get a key ring's empty IAM policy`, async () => {
    const output = execSync(
      `node getKeyringIamPolicy.js ${projectId} ${keyRingName}`
    );
    assert.match(
      output,
      new RegExp(`Policy for key ring ${keyRingName} is empty.`)
    );
  });

  it(`should grant access to a key ring`, async () => {
    const output = execSync(
      `node addMemberToKeyRingPolicy.js ${projectId} ${keyRingName} ${member} ${role}`
    );
    assert.match(
      output,
      new RegExp(
        `${member}/${role} combo added to policy for key ring ${keyRingName}.`
      )
    );
  });

  it(`should get a key ring's updated IAM policy`, async () => {
    const output = execSync(
      `node getKeyringIamPolicy.js ${projectId} ${keyRingName}`
    );
    assert.match(output, new RegExp(`${role}:`));
    assert.match(output, new RegExp(`  ${member}`));
  });

  it(`should revoke access to a key ring`, async () => {
    const output = execSync(
      `node removeMemberFromKeyRingPolicy.js ${projectId} ${keyRingName} ${member} ${role}`
    );
    assert.match(
      output,
      new RegExp(
        `${member}/${role} combo removed from policy for key ring ${keyRingName}.`
      )
    );
  });

  it(`should create a key`, async () => {
    const output = execSync(
      `node createCryptoKey.js ${projectId} ${keyRingName} ${keyNameOne}`
    );
    if (!output.includes(`CryptoKey ${formattedKeyName} already exists`)) {
      assert.match(output, new RegExp(`Key ${formattedKeyName} created.`));
    }
  });

  it(`should list keys`, async () => {
    const output = execSync(
      `node listCryptoKeys.js ${projectId} ${keyRingName}`
    );
    assert.match(output, new RegExp(formattedKeyName));
  });

  it(`should get a key`, async () => {
    const output = execSync(
      `node getCryptoKey.js ${projectId} ${keyRingName} ${keyNameOne}`
    );
    assert.match(output, new RegExp(`Name: ${formattedKeyName}`));
    assert.match(output, new RegExp(`Created: `));
  });

  it(`should set a crypto key's primary version`, async () => {
    const output = execSync(
      `node setPrimaryCryptoKeyVersion.js ${projectId} ${keyRingName} ${keyNameOne} 1`
    );
    assert.match(
      output,
      new RegExp(`Set 1 as primary version for crypto key ${keyNameOne}.\n`)
    );
  });

  it(`should encrypt a file`, async () => {
    const output = execSync(
      `node encrypt.js ${projectId} ${keyRingName} ${keyNameOne} "${plaintext}" "${ciphertext}"`
    );
    assert.match(
      output,
      new RegExp(
        `Encrypted ${plaintext} using ${formattedKeyName}/cryptoKeyVersions/1.`
      )
    );
    assert.match(output, new RegExp(`Result saved to ${ciphertext}.`));
  });

  it(`should decrypt a file`, async () => {
    const output = execSync(
      `node decrypt.js ${projectId} "${keyRingName}" "${keyNameOne}" "${ciphertext}" "${decrypted}"`
    );
    assert.match(
      output,
      new RegExp(`Decrypted ${ciphertext}, result saved to ${decrypted}.`)
    );

    assert.strictEqual(
      fs.readFileSync(plaintext, 'utf8'),
      fs.readFileSync(decrypted, 'utf8')
    );
  });

  it(`should create a crypto key version`, async () => {
    const output = execSync(
      `node createCryptoKeyVersion ${projectId} "${keyRingName}" "${keyNameOne}"`
    );
    assert.match(
      output,
      new RegExp(`Crypto key version ${formattedKeyName}/cryptoKeyVersions/`)
    );
    assert.match(output, new RegExp(` created.`));
  });

  it(`should list crypto key versions`, async () => {
    const output = execSync(
      `node listCryptoKeyVersions.js ${projectId} "${keyRingName}" "${keyNameOne}"`
    );
    assert.match(output, new RegExp(`${formattedKeyName}/cryptoKeyVersions/1`));
  });

  it(`should destroy a crypto key version`, async () => {
    const output = execSync(
      `node destroyCryptoKeyVersion ${projectId} "${keyRingName}" "${keyNameOne}" 2`
    );
    assert.match(
      output,
      new RegExp(
        `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 destroyed.`
      )
    );
  });

  it(`should restore a crypto key version`, async () => {
    const output = execSync(
      `node restoreCryptoKeyVersion ${projectId} "${keyRingName}" "${keyNameOne}" 2`
    );
    assert.match(
      output,
      new RegExp(
        `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 restored.`
      )
    );
  });

  it(`should enable a crypto key version`, async () => {
    const output = execSync(
      `node enableCryptoKeyVersion ${projectId} "${keyRingName}" "${keyNameOne}" 2`
    );
    assert.match(
      output,
      new RegExp(
        `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 enabled.`
      )
    );
  });

  it(`should disable a crypto key version`, async () => {
    const output = execSync(
      `node disableCryptoKeyVersion ${projectId} "${keyRingName}" "${keyNameOne}" 2`
    );
    assert.match(
      output,
      new RegExp(
        `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 disabled.`
      )
    );
  });

  it(`should get a crypto key's empty IAM policy`, async () => {
    const output = execSync(
      `node getCryptoKeyIamPolicy ${projectId} "${keyRingName}" "${keyNameOne}"`
    );
    assert.match(
      output,
      new RegExp(`Policy for crypto key ${keyNameOne} is empty.`)
    );
  });

  it(`should grant access to a crypto key`, async () => {
    const output = execSync(
      `node addMemberToCryptoKeyPolicy ${projectId} "${keyRingName}" "${keyNameOne}" "${member}" "${role}"`
    );
    assert.match(
      output,
      new RegExp(
        `${member}/${role} combo added to policy for crypto key ${keyNameOne}.`
      )
    );
  });

  it(`should get a crypto key's updated IAM policy`, async () => {
    const output = execSync(
      `node getCryptoKeyIamPolicy ${projectId} "${keyRingName}" "${keyNameOne}"`
    );
    assert.match(output, new RegExp(`${role}:`));
    assert.match(output, new RegExp(`  ${member}`));
  });

  it(`should revoke access to a crypto key`, async () => {
    const output = execSync(
      `node removeMemberCryptoKeyPolicy ${projectId} "${keyRingName}" "${keyNameOne}" ${member} ${role}`
    );
    assert.match(
      output,
      new RegExp(
        `${member}/${role} combo removed from policy for crypto key ${keyNameOne}.`
      )
    );
  });

  describe('asymmetric keys', () => {
    const kms = require('../../src');
    const client = new kms.KeyManagementServiceClient();

    const locationId = `global`;
    const keyRingId = `test-asymmetric-ring-${uuidv4()}`;
    const keyAsymmetricDecryptName = `test-asymmetric-decrypt-${uuidv4()}`;

    const keyAsymmetricSignName = `test-asymmetric-sign-${uuidv4()}`;

    const dataToEncrypt = 'my data to encrypt';
    const dataToSign = 'my data to sign';

    let decryptKeyVersionId;
    let signKeyVersionId;
    let ciphertext;
    let signature;

    before(async function() {
      // KMS keys can be created but still in "pending generation" state. This
      // waits for the key version to reach the desired state.
      const waitForState = async (name, state) => {
        const sleep = w => new Promise(r => setTimeout(r, w));

        let [version] = await client.getCryptoKeyVersion({name});
        while (version.state !== state) {
          await sleep(250);
          [version] = await client.getCryptoKeyVersion({name});
        }
      };

      // Create parent keyring
      const parent = client.locationPath(projectId, locationId);
      const [keyRing] = await client.createKeyRing({
        parent: parent,
        keyRingId: keyRingId,
      });

      // Create asymmetric decryption key - this also creates the first key
      // version.
      const [asymDecryptKey] = await client.createCryptoKey({
        parent: keyRing.name,
        cryptoKeyId: keyAsymmetricDecryptName,
        cryptoKey: {
          purpose: 'ASYMMETRIC_DECRYPT',
          versionTemplate: {
            algorithm: 'RSA_DECRYPT_OAEP_4096_SHA256',
          },
        },
      });

      // Wait for the first key to be ready.
      decryptKeyVersionId = asymDecryptKey.name + '/cryptoKeyVersions/1';
      await waitForState(decryptKeyVersionId, 'ENABLED');

      // Create asymmetric signing key - this also creates the first key
      // version.
      const [asymSignKey] = await client.createCryptoKey({
        parent: keyRing.name,
        cryptoKeyId: keyAsymmetricSignName,
        cryptoKey: {
          purpose: 'ASYMMETRIC_SIGN',
          versionTemplate: {
            algorithm: 'EC_SIGN_P384_SHA384',
          },
        },
      });

      // Wait for the first key to be ready.
      signKeyVersionId = asymSignKey.name + '/cryptoKeyVersions/1';
      await waitForState(signKeyVersionId, 'ENABLED');
    });

    after(async function() {
      await client.destroyCryptoKeyVersion({name: decryptKeyVersionId});
      await client.destroyCryptoKeyVersion({name: signKeyVersionId});
    });

    it(`should perform asymmetric encryption`, async function() {
      // Only run this test on Node 12+
      if (nodeMajorVersion < 12) {
        this.skip();
      }

      const out = execSync(`
        node asymmetricEncrypt.js \
          "${projectId}" \
          "${keyRingId}" \
          "${keyAsymmetricDecryptName}" \
          "1" \
          "${dataToEncrypt}"
        `);

      const re = new RegExp(`Encrypted ciphertext: (.+)`);
      assert.match(out, re);

      const match = re.exec(out);
      ciphertext = match[1];
    });

    it(`should perform asymmetric decryption`, async function() {
      // Only run this test on Node 12+
      if (nodeMajorVersion < 12) {
        this.skip();
      }

      const out = execSync(`
        node asymmetricDecrypt.js \
        "${projectId}" \
        "${keyRingId}" \
        "${keyAsymmetricDecryptName}" \
        "1" \
        "${ciphertext}"
      `);

      const re = new RegExp(`Decrypted plaintext: (.+)`);
      assert.match(out, re);

      const match = re.exec(out);
      const plaintext = match[1];

      assert.equal(dataToEncrypt, plaintext);
    });

    it(`should perform asymmetric signing`, async function() {
      const out = execSync(`
        node asymmetricSign.js \
          "${projectId}" \
          "${keyRingId}" \
          "${keyAsymmetricSignName}" \
          "1" \
          "${dataToSign}"
        `);

      const re = new RegExp(`Signature: (.+)`);
      assert.match(out, re);

      const match = re.exec(out);
      signature = match[1];
    });

    it(`should perform asymmetric verification`, async function() {
      const out = execSync(`
        node asymmetricVerify.js \
        "${projectId}" \
        "${keyRingId}" \
        "${keyAsymmetricSignName}" \
        "1" \
        "${dataToSign}" \
        "${signature}"
      `);

      const re = new RegExp(`Signature verified: (.+)`);
      assert.match(out, re);

      const match = re.exec(out);
      const verified = match[1];

      // Correct plaintext
      assert.equal(verified, 'true');
    });
  });
});
