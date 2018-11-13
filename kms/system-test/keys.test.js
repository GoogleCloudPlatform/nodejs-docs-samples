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

const fs = require(`fs`);
const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cmd = `node keys.js`;
const cwd = path.join(__dirname, `..`);
const keyRingName = `test-ring-${uuid.v4()}`;
const keyNameOne = `test-key-${uuid.v4()}`;
const member = `allAuthenticatedUsers`;
const role = `roles/viewer`;
const projectId = process.env.GCLOUD_PROJECT;

const plaintext = path.join(__dirname, `../resources/plaintext.txt`);
const ciphertext = path.join(__dirname, `../resources/plaintext.txt.encrypted`);
const decrypted = path.join(__dirname, `../resources/plaintext.txt.decrypted`);

const unspecifiedKeyRingName = `projects/${projectId}/locations/global/keyRings/`;
const formattedKeyRingName = `projects/${projectId}/locations/global/keyRings/${keyRingName}`;
const formattedKeyName = `${formattedKeyRingName}/cryptoKeys/${keyNameOne}`;

test.before(tools.checkCredentials);
test.before.cb(t => {
  // Delete the ciphertext file, if it exists
  fs.unlink(ciphertext, () => {
    // Delete the decrypted file, if it exists
    fs.unlink(decrypted, () => t.end());
  });
});

test.after.always.cb(t => {
  // Delete the ciphertext file, if it exists
  fs.unlink(ciphertext, () => {
    // Delete the decrypted file, if it exists
    fs.unlink(decrypted, () => t.end());
  });
});

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

// Key ring tests

test.serial(`should create a key ring`, async t => {
  const output = await tools.runAsync(
    `${cmd} keyrings create "${keyRingName}"`,
    cwd
  );
  if (!output.includes(`KeyRing ${formattedKeyRingName} already exists`)) {
    t.regex(output, new RegExp(`Key ring ${formattedKeyRingName} created.`));
  } else {
    t.pass();
  }
});

test.serial(`should list key rings`, async t => {
  await tools
    .tryTest(async () => {
      const output = await tools.runAsync(`${cmd} keyrings list`, cwd);
      t.regex(output, new RegExp(unspecifiedKeyRingName));
    })
    .start();
});

test.serial(`should get a key ring`, async t => {
  const output = await tools.runAsync(
    `${cmd} keyrings get "${keyRingName}"`,
    cwd
  );
  t.regex(output, new RegExp(`Name: ${formattedKeyRingName}`));
  t.regex(output, new RegExp(`Created: `));
});

// Key ring IAM tests

test.serial(`should get a key ring's empty IAM policy`, async t => {
  const output = await tools.runAsync(
    `${cmd} keyrings get-policy "${keyRingName}"`,
    cwd
  );
  t.regex(output, new RegExp(`Policy for key ring ${keyRingName} is empty.`));
});

test.serial(`should grant access to a key ring`, async t => {
  const output = await tools.runAsync(
    `${cmd} keyrings grant-access "${keyRingName}" ${member} ${role}`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `${member}/${role} combo added to policy for key ring ${keyRingName}.`
    )
  );
});

test.serial(`should get a key ring's updated IAM policy`, async t => {
  await tools
    .tryTest(async () => {
      const output = await tools.runAsync(
        `${cmd} keyrings get-policy "${keyRingName}"`,
        cwd
      );
      t.regex(output, new RegExp(`${role}:`));
      t.regex(output, new RegExp(`  ${member}`));
    })
    .start();
});

test.serial(`should revoke access to a key ring`, async t => {
  const output = await tools.runAsync(
    `${cmd} keyrings revoke-access "${keyRingName}" ${member} ${role}`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `${member}/${role} combo removed from policy for key ring ${keyRingName}.`
    )
  );
});

// Crypto key tests
test.serial(`should create a key`, async t => {
  const output = await tools.runAsync(
    `${cmd} create "${keyRingName}" "${keyNameOne}"`,
    cwd
  );
  if (!output.includes(`CryptoKey ${formattedKeyName} already exists`)) {
    t.regex(output, new RegExp(`Key ${formattedKeyName} created.`));
  } else {
    t.pass();
  }
});

test.serial(`should list keys`, async t => {
  await tools
    .tryTest(async () => {
      const output = await tools.runAsync(`${cmd} list "${keyRingName}"`, cwd);
      t.regex(output, new RegExp(formattedKeyName));
    })
    .start();
});

test.serial(`should get a key`, async t => {
  const output = await tools.runAsync(
    `${cmd} get "${keyRingName}" "${keyNameOne}"`,
    cwd
  );
  t.regex(output, new RegExp(`Name: ${formattedKeyName}`));
  t.regex(output, new RegExp(`Created: `));
});

test.serial(`should set a crypto key's primary version`, async t => {
  const output = await tools.runAsync(
    `${cmd} set-primary "${keyRingName}" "${keyNameOne}" 1`,
    cwd
  );
  t.regex(
    output,
    new RegExp(`Set 1 as primary version for crypto key ${keyNameOne}.\n`)
  );
});

test.serial(`should encrypt a file`, async t => {
  const output = await tools.runAsync(
    `${cmd} encrypt "${keyRingName}" "${keyNameOne}" "${plaintext}" "${ciphertext}"`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `Encrypted ${plaintext} using ${formattedKeyName}/cryptoKeyVersions/1.`
    )
  );
  t.regex(output, new RegExp(`Result saved to ${ciphertext}.`));
});

test.serial(`should decrypt a file`, async t => {
  const output = await tools.runAsync(
    `${cmd} decrypt "${keyRingName}" "${keyNameOne}" "${ciphertext}" "${decrypted}"`,
    cwd
  );
  t.regex(
    output,
    new RegExp(`Decrypted ${ciphertext}, result saved to ${decrypted}.`)
  );
  t.is(fs.readFileSync(plaintext, 'utf8'), fs.readFileSync(decrypted, 'utf8'));
});

test.serial(`should create a crypto key version`, async t => {
  const output = await tools.runAsync(
    `${cmd} versions create "${keyRingName}" "${keyNameOne}"`,
    cwd
  );
  t.regex(
    output,
    new RegExp(`Crypto key version ${formattedKeyName}/cryptoKeyVersions/`)
  );
  t.regex(output, new RegExp(` created.`));
});

test.serial(`should list crypto key versions`, async t => {
  await tools
    .tryTest(async () => {
      const output = await tools.runAsync(
        `${cmd} versions list "${keyRingName}" "${keyNameOne}"`,
        cwd
      );
      t.regex(output, new RegExp(`${formattedKeyName}/cryptoKeyVersions/1`));
    })
    .start();
});

test.serial(`should destroy a crypto key version`, async t => {
  const output = await tools.runAsync(
    `${cmd} versions destroy "${keyRingName}" "${keyNameOne}" 2`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 destroyed.`
    )
  );
});

test.serial(`should restore a crypto key version`, async t => {
  const output = await tools.runAsync(
    `${cmd} versions restore "${keyRingName}" "${keyNameOne}" 2`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 restored.`
    )
  );
});

test.serial(`should enable a crypto key version`, async t => {
  const output = await tools.runAsync(
    `${cmd} versions enable "${keyRingName}" "${keyNameOne}" 2`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 enabled.`
    )
  );
});

test.serial(`should disable a crypto key version`, async t => {
  const output = await tools.runAsync(
    `${cmd} versions disable "${keyRingName}" "${keyNameOne}" 2`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `Crypto key version ${formattedKeyName}/cryptoKeyVersions/2 disabled.`
    )
  );
});

// Crypto key IAM tests

test.serial(`should get a crypto key's empty IAM policy`, async t => {
  const output = await tools.runAsync(
    `${cmd} get-policy "${keyRingName}" "${keyNameOne}"`,
    cwd
  );
  t.regex(output, new RegExp(`Policy for crypto key ${keyNameOne} is empty.`));
});

test.serial(`should grant access to a crypto key`, async t => {
  const output = await tools.runAsync(
    `${cmd} grant-access "${keyRingName}" "${keyNameOne}" ${member} ${role}`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `${member}/${role} combo added to policy for crypto key ${keyNameOne}.`
    )
  );
});

test.serial(`should get a crypto key's updated IAM policy`, async t => {
  await tools
    .tryTest(async () => {
      const output = await tools.runAsync(
        `${cmd} get-policy "${keyRingName}" "${keyNameOne}"`,
        cwd
      );
      t.regex(output, new RegExp(`${role}:`));
      t.regex(output, new RegExp(`  ${member}`));
    })
    .start();
});

test.serial(`should revoke access to a crypto key`, async t => {
  const output = await tools.runAsync(
    `${cmd} revoke-access "${keyRingName}" "${keyNameOne}" ${member} ${role}`,
    cwd
  );
  t.regex(
    output,
    new RegExp(
      `${member}/${role} combo removed from policy for crypto key ${keyNameOne}.`
    )
  );
});
