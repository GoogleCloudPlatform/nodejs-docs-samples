/**
 * Copyright 2018, Google, Inc.
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

const path = require('path');
const {assert} = require('chai');
const fs = require('fs');
const execa = require('execa');

const cmd = 'node deid.js';
const exec = async cmd => {
  const res = await execa.shell(cmd);
  if (res.stderr) {
    throw new Error(res.stderr);
  }
  return res.stdout;
};
const harmfulString = 'My SSN is 372819127';
const harmlessString = 'My favorite color is blue';
const surrogateType = 'SSN_TOKEN';
let labeledFPEString;
const wrappedKey = process.env.DLP_DEID_WRAPPED_KEY;
const keyName = process.env.DLP_DEID_KEY_NAME;
const csvFile = 'resources/dates.csv';
const tempOutputFile = path.join(__dirname, 'temp.result.csv');
const csvContextField = 'name';
const dateShiftAmount = 30;
const dateFields = 'birth_date register_date';

describe('deid', () => {
  // deidentify_masking
  it('should mask sensitive data in a string', async () => {
    const output = await exec(`${cmd} deidMask "${harmfulString}" -m x -n 5`);
    assert.strictEqual(output, 'My SSN is xxxxx9127');
  });

  it('should ignore insensitive data when masking a string', async () => {
    const output = await exec(`${cmd} deidMask "${harmlessString}"`);
    assert.strictEqual(output, harmlessString);
  });

  it('should handle masking errors', async () => {
    const output = await exec(`${cmd} deidMask "${harmfulString}" -n -1`);
    assert.match(output, /Error in deidentifyWithMask/);
  });

  // deidentify_fpe
  it('should FPE encrypt sensitive data in a string', async () => {
    const output = await exec(
      `${cmd} deidFpe "${harmfulString}" ${wrappedKey} ${keyName} -a NUMERIC`
    );
    assert.match(output, /My SSN is \d{9}/);
    assert.notStrictEqual(output, harmfulString);
  });

  it('should use surrogate info types in FPE encryption', async () => {
    const output = await exec(
      `${cmd} deidFpe "${harmfulString}" ${wrappedKey} ${keyName} -a NUMERIC -s ${surrogateType}`
    );
    assert.match(output, /My SSN is SSN_TOKEN\(9\):\d{9}/);
    labeledFPEString = output;
  });

  it('should ignore insensitive data when FPE encrypting a string', async () => {
    const output = await exec(
      `${cmd} deidFpe "${harmlessString}" ${wrappedKey} ${keyName}`
    );
    assert.strictEqual(output, harmlessString);
  });

  it('should handle FPE encryption errors', async () => {
    const output = await exec(
      `${cmd} deidFpe "${harmfulString}" ${wrappedKey} BAD_KEY_NAME`
    );
    assert.match(output, /Error in deidentifyWithFpe/);
  });

  // reidentify_fpe
  it('should FPE decrypt surrogate-typed sensitive data in a string', async () => {
    assert.ok(labeledFPEString, 'Verify that FPE encryption succeeded.');
    const output = await exec(
      `${cmd} reidFpe "${labeledFPEString}" ${surrogateType} ${wrappedKey} ${keyName} -a NUMERIC`
    );
    assert.strictEqual(output, harmfulString);
  });

  it('should handle FPE decryption errors', async () => {
    const output = await exec(
      `${cmd} reidFpe "${harmfulString}" ${surrogateType} ${wrappedKey} BAD_KEY_NAME -a NUMERIC`
    );
    assert.match(output, /Error in reidentifyWithFpe/);
  });

  // deidentify_date_shift
  it('should date-shift a CSV file', async () => {
    const outputCsvFile = 'dates.actual.csv';
    const output = await exec(
      `${cmd} deidDateShift "${csvFile}" "${outputCsvFile}" ${dateShiftAmount} ${dateShiftAmount} ${dateFields}`
    );
    assert.match(
      output,
      new RegExp(`Successfully saved date-shift output to ${outputCsvFile}`)
    );
    assert.notStrictEqual(
      fs.readFileSync(outputCsvFile).toString(),
      fs.readFileSync(csvFile).toString()
    );
  });

  it('should date-shift a CSV file using a context field', async () => {
    const outputCsvFile = 'dates-context.actual.csv';
    const expectedCsvFile =
      'system-test/resources/date-shift-context.expected.csv';
    const output = await exec(
      `${cmd} deidDateShift "${csvFile}" "${outputCsvFile}" ${dateShiftAmount} ${dateShiftAmount} ${dateFields} -f ${csvContextField} -n ${keyName} -w ${wrappedKey}`
    );
    assert.match(
      output,
      new RegExp(`Successfully saved date-shift output to ${outputCsvFile}`)
    );
    assert.strictEqual(
      fs.readFileSync(outputCsvFile).toString(),
      fs.readFileSync(expectedCsvFile).toString()
    );
  });

  it('should require all-or-none of {contextField, wrappedKey, keyName}', async () => {
    const output = await exec(
      `${cmd} deidDateShift "${csvFile}" "${tempOutputFile}" ${dateShiftAmount} ${dateShiftAmount} ${dateFields} -f ${csvContextField} -n ${keyName}`
    );
    assert.match(output, /You must set either ALL or NONE of/);
  });

  it('should handle date-shift errors', async () => {
    const output = await exec(
      `${cmd} deidDateShift "${csvFile}" "${tempOutputFile}" ${dateShiftAmount} ${dateShiftAmount}`
    );
    assert.match(output, /Error in deidentifyWithDateShift/);
  });
});
