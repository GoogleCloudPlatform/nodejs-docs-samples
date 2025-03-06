// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

import { join } from 'path';
import { assert } from 'chai';
import { describe, it, before } from 'mocha';
import { readFileSync } from 'fs';
import { execSync as _execSync } from 'child_process';
import DLP, { DlpServiceClient } from '@google-cloud/dlp';
import proxyquire from 'proxyquire';
import { restore, stub, replace, assert as _assert, fake } from 'sinon';
import { MOCK_DATA } from './mockdata';

const execSync = cmd => _execSync(cmd, {encoding: 'utf-8'});

const harmfulString = 'My SSN is 372819127';
const harmlessString = 'My favorite color is blue';
const surrogateType = 'SSN_TOKEN';
const csvFile = 'resources/dates.csv';
const tempOutputFile = join(__dirname, 'temp.result.csv');
const dateShiftAmount = 30;
const dateFields = 'birth_date,register_date';
const keyName = 'KEY_NAME';
const wrappedKey = 'WRAPPED_KEY';
const unwrappedKey = 'YWJjZGVmZ2hpamtsbW5vcA==';

// Dummy resource names used in test cases mocking API Calls.
const inputDirectory = 'MOCK_INPUT_DIRECTORY';
const datasetId = 'MOCK_DATASET_ID';
const tableId = 'MOCK_TABLE_ID';
const outputDirectory = 'MOCK_OUTPUT_DIRECTORY';
const deidentifyTemplateId = 'MOCK_DEIDENTIFY_TEMPLATE';
const structuredDeidentifyTemplateId = 'MOCK_STRUCTURED_ DEIDENTIFY_TEMPLATE';
const imageRedactTemplateId = 'MOCK_IMAGE_REDACT_TEMPLATE';

const client = new DlpServiceClient();
describe('deid', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });

  afterEach(async () => {
    restore();
  });

  // deidentify_masking
  it('should mask sensitive data in a string', () => {
    const output = execSync(
      `node deidentifyWithMask.js ${projectId} "${harmfulString}" x 5`
    );
    assert.include(output, 'My SSN is xxxxx9127');
  });

  it('should ignore insensitive data when masking a string', () => {
    const output = execSync(
      `node deidentifyWithMask.js ${projectId} "${harmlessString}"`
    );
    assert.include(output, harmlessString);
  });

  // deidentify_fpe
  it('should handle FPE encryption errors', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithFpe.js ${projectId} "${harmfulString}" '[0-9A-Za-z]' 'BAD_KEY_NAME' 'BAD_KEY_NAME'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'invalid encoding');
  });

  // reidentify_fpe
  it('should handle FPE decryption errors', () => {
    let output;
    try {
      output = execSync(
        `node reidentifyWithFpe.js ${projectId} "${harmfulString}" '[0-9A-Za-z]' ${surrogateType} 'BAD_KEY_NAME' 'BAD_KEY_NAME NUMERIC'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'invalid encoding');
  });

  // deidentify_date_shift
  it('should date-shift a CSV file', () => {
    const outputCsvFile = 'dates.actual.csv';
    const output = execSync(
      `node deidentifyWithDateShift.js ${projectId} "${csvFile}" "${outputCsvFile}" ${dateFields} ${dateShiftAmount} ${dateShiftAmount}`
    );
    assert.include(
      output,
      `Successfully saved date-shift output to ${outputCsvFile}`
    );
    assert.notInclude(
      readFileSync(outputCsvFile).toString(),
      readFileSync(csvFile).toString()
    );
  });

  it('should handle date-shift errors', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithDateShift.js ${projectId} "${csvFile}" "${tempOutputFile}" ${dateShiftAmount} ${dateShiftAmount}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_simple_word_list
  it('should deidentify using the word list provided', () => {
    const textToInspect =
      'Patient was seen in RM-YELLOW then transferred to rm green.';
    const wordsStr = 'RM-GREEN,RM-YELLOW,RM-ORANGE';
    const customInfoTypeName = 'CUSTOM_ROOM_ID';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithSimpleWordList.js ${projectId} "${textToInspect}" "${wordsStr}" "${customInfoTypeName}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(
      output,
      'Patient was seen in [CUSTOM_ROOM_ID] then transferred to [CUSTOM_ROOM_ID].'
    );
  });

  it('should handle deidentification errors', () => {
    const textToInspect =
      'Patient was seen in RM-YELLOW then transferred to rm green.';
    const wordsStr = 'RM-GREEN,RM-YELLOW,RM-ORANGE';
    const customInfoTypeName = 'CUSTOM_ROOM_ID';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithSimpleWordList.js 'BAD_PROJECT_ID' "${textToInspect}" "${wordsStr}" "${customInfoTypeName}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_exception_list
  it('should exclude the words during inspection', () => {
    const textToInspect =
      'jack@example.org accessed customer record of user5@example.com';
    const words = 'jack@example.org,jill@example.org';
    const infoTypes = 'EMAIL_ADDRESS';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithExceptionList.js ${projectId} "${textToInspect}" "${words}" "${infoTypes}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(
      output,
      'jack@example.org accessed customer record of [EMAIL_ADDRESS]'
    );
  });

  it('should handle deidentification errors', () => {
    const textToInspect =
      'jack@example.org accessed customer record of user5@example.com';
    const words = 'jack@example.org,jill@example.org';
    const infoTypes = 'EMAIL_ADDRESS';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithExceptionList.js 'BAD_PROJECT_ID' "${textToInspect}" "${words}" "${infoTypes}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_redact
  it('should redact the matched input values', () => {
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithRedaction.js ${projectId} "${string}" EMAIL_ADDRESS`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(
      output,
      'My name is Alicia Abernathy, and my email address is .'
    );
  });

  it('should handle deidentification errors', () => {
    let output;
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';
    try {
      output = execSync(
        `node deIdentifyWithRedaction.js ${projectId} "${string}" BAD_TYPE`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_infotypes
  it('should replace the matched input in table', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableInfoTypes.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.notMatch(output, /Charles Dickens/);
    assert.notMatch(output, /Jane Austen/);
    assert.notMatch(output, /Mark Twain/);
    assert.match(output, /PERSON_NAME/);
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deIdentifyTableInfoTypes.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_condition_masking
  it('should replace the matched input in table', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableConditionMasking.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /"stringValue":"\*\*"/);
    assert.match(output, /"integerValue":"21"/);
    assert.match(output, /"integerValue":"75"/);
    assert.notMatch(output, /"integerValue":"95"/);
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync(
        'node deIdentifyTableConditionMasking.js BAD_PROJECT_ID'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_condition_infotypes
  it('should redact PERSON_NAME findings when conditions are met', () => {
    let output;
    try {
      output = execSync(
        `node deIdentifyTableConditionInfoTypes.js ${projectId}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.notInclude(output, 'Charles Dickens');
    assert.include(output, 'Jane Austen');
    assert.include(output, 'Mark Twain');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync(
        'node deIdentifyTableConditionInfoTypes.js BAD_PROJECT_ID'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_row_suppress
  it('should suppress a row if conditions are met', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableRowSuppress.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.notInclude(output, 'Charles Dickens');
    assert.include(output, 'Jane Austen');
    assert.include(output, 'Mark Twain');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deIdentifyTableRowSuppress.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_bucketing
  it('should transform column HAPPINESS SCORE using table bucketing configs', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableBucketing.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.include(output, '90:100');
    assert.include(output, '20:30');
    assert.include(output, '70:80');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deIdentifyTableBucketing.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_time_extract
  it('should replace sensitive data in a string using time extraction', () => {
    let output;
    try {
      output = execSync(`node deidentifyWithTimeExtraction.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /"stringValue":"1970"/);
    assert.match(output, /"stringValue":"1996"/);
    assert.match(output, /"stringValue":"1988"/);
    assert.match(output, /"stringValue":"2001"/);
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deidentifyWithTimeExtraction.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_fpe
  it('should de-identify table using Format Preserving Encryption (FPE)', async () => {
    const CONSTANT_DATA = MOCK_DATA.DEIDENTIFY_TABLE_WITH_FPE(
      projectId,
      'NUMERIC',
      keyName,
      wrappedKey
    );

    const mockDeidentifyContent = stub()
      .resolves(CONSTANT_DATA.RESPONSE_DEIDENTIFY_CONTENT);

    replace(
      DlpServiceClient.prototype,
      'deidentifyContent',
      mockDeidentifyContent
    );
    replace(console, 'log', () => stub());

    const deIdentifyTableWithFpe = proxyquire('../deIdentifyTableWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await deIdentifyTableWithFpe(projectId, 'NUMERIC', keyName, wrappedKey);

    _assert.calledOnceWithExactly(
      mockDeidentifyContent,
      CONSTANT_DATA.REQUEST_DEIDENTIFY_CONTENT
    );
  });

  it('should handle de-identification errors', async () => {
    const mockDeidentifyContent = stub().rejects(new Error('Failed'));
    replace(
      DlpServiceClient.prototype,
      'deidentifyContent',
      mockDeidentifyContent
    );
    replace(console, 'log', () => stub());

    const deIdentifyTableWithFpe = proxyquire('../deIdentifyTableWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    try {
      await deIdentifyTableWithFpe(projectId, 'NUMERIC', keyName, wrappedKey);
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_deidentify_free_text_with_fpe_using_surrogate
  it('should de-identify table using Format Preserving Encryption (FPE) with surrogate', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithFpeSurrogate.js ${projectId} "My phone number is 4359916732" ALPHA_NUMERIC PHONE_NUMBER PHONE_TOKEN "${unwrappedKey}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /PHONE_TOKEN\(10\):Vz6T6ff4J7/);
  });

  it('should handle de-identification errors', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithFpeSurrogate.js ${projectId} "My phone numer is 4359916732" ALPHA_NUMERIC BAD_TYPE PHONE_TOKEN "${unwrappedKey}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_reidentify_free_text_with_fpe_using_surrogate
  it('should re-identify table using Format Preserving Encryption (FPE) with surrogate', () => {
    let output;
    try {
      output = execSync(
        `node reidentifyWithFpeSurrogate.js ${projectId} "My phone number is PHONE_TOKEN(10):Vz6T6ff4J7" ALPHA_NUMERIC PHONE_TOKEN "${unwrappedKey}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /My phone number is 4359916732/);
  });

  it('should handle re-identification errors', () => {
    let output;
    try {
      output = execSync(
        `node reidentifyWithFpeSurrogate.js ${projectId} "My phone number is PHONE_TOKEN(10):Vz6T6ff4J7" ALPHA_NUMERIC PHONE_TOKEN INVALID_KEY`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_deterministic
  it('should de-identify string using deterministic encryption', async () => {
    const infoTypes = [{name: 'EMAIL_ADDRESS'}];
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';
    const CONSTANT_DATA = MOCK_DATA.DEIDENTIFY_WITH_DETEMINISTIC(
      projectId,
      string,
      infoTypes,
      keyName,
      wrappedKey,
      'EMAIL_ADDRESS_TOKEN'
    );

    const mockDeidentifyContent = stub()
      .resolves(CONSTANT_DATA.RESPONSE_DEIDENTIFY_CONTENT);

    replace(
      DlpServiceClient.prototype,
      'deidentifyContent',
      mockDeidentifyContent
    );
    replace(console, 'log', () => stub());

    const deIdentifyWithDeterministic = proxyquire(
      '../deidentifyWithDeterministic.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    await deIdentifyWithDeterministic(
      projectId,
      string,
      'EMAIL_ADDRESS',
      keyName,
      wrappedKey,
      'EMAIL_ADDRESS_TOKEN'
    );

    _assert.calledOnceWithExactly(
      mockDeidentifyContent,
      CONSTANT_DATA.REQUEST_DEIDENTIFY_CONTENT
    );
  });

  it('should handle de-identification errors', async () => {
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';

    const mockDeidentifyContent = stub().rejects(new Error('Failed'));

    replace(
      DlpServiceClient.prototype,
      'deidentifyContent',
      mockDeidentifyContent
    );
    replace(console, 'log', () => stub());

    const deIdentifyWithDeterministic = proxyquire(
      '../deidentifyWithDeterministic.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    try {
      await deIdentifyWithDeterministic(
        projectId,
        string,
        'EMAIL_ADDRESS',
        keyName,
        wrappedKey,
        'EMAIL_ADDRESS_TOKEN'
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_reidentify_deterministic
  it('should re-identify string using deterministic encryption', async () => {
    const string =
      'My name is Alicia Abernathy, and my email address is EMAIL_ADDRESS_TOKEN';
    const CONSTANT_DATA = MOCK_DATA.REIDENTIFY_WITH_DETEMINISTIC(
      projectId,
      string,
      keyName,
      wrappedKey,
      'EMAIL_ADDRESS_TOKEN'
    );

    const mockReidentifyContent = stub()
      .resolves(CONSTANT_DATA.RESPONSE_REIDENTIFY_CONTENT);

    replace(
      DlpServiceClient.prototype,
      'reidentifyContent',
      mockReidentifyContent
    );
    replace(console, 'log', () => stub());

    const reIdentifyWithDeterministic = proxyquire(
      '../reidentifyWithDeterministic.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    await reIdentifyWithDeterministic(
      projectId,
      string,
      keyName,
      wrappedKey,
      'EMAIL_ADDRESS_TOKEN'
    );

    _assert.calledOnceWithExactly(
      mockReidentifyContent,
      CONSTANT_DATA.REQUEST_REIDENTIFY_CONTENT
    );
  });

  it('should handle re-identification errors', async () => {
    const string =
      'My name is Alicia Abernathy, and my email address is EMAIL_ADDRESS_TOKEN';

    const mockReidentifyContent = stub().rejects(new Error('Failed'));

    replace(
      DlpServiceClient.prototype,
      'reidentifyContent',
      mockReidentifyContent
    );
    replace(console, 'log', () => stub());

    const reIdentifyWithDeterministic = proxyquire(
      '../reidentifyWithDeterministic.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    try {
      await reIdentifyWithDeterministic(
        projectId,
        string,
        keyName,
        wrappedKey,
        'EMAIL_ADDRESS_TOKEN'
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_deidentify_table_with_crypto_hash
  it('should deidentify table using defined crypto key', () => {
    let output;
    try {
      output = execSync(
        `node deIdentifyTableWithCryptoHash.js ${projectId} CRYPTO_KEY_1`
      );
    } catch (err) {
      output = err.message;
    }
    assert.notMatch(output, /"stringValue": user1@example.org/);
    assert.notMatch(output, /"stringValue": user2@example.org/);
    assert.notInclude(output, '858-555-0224');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync(
        'node deIdentifyTableWithCryptoHash.js BAD_PROJECT_ID CRYPTO_KEY_1'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_with_multiple_crypto_hash
  it('should transform columns in the table using two separate cryptographic hash transformations', () => {
    let output;
    try {
      output = execSync(
        `node deIdentifyTableWithMultipleCryptoHash.js ${projectId} CRYPTO_KEY_1 CRYPTO_KEY_2`
      );
    } catch (err) {
      output = err.message;
    }
    assert.notMatch(output, /"stringValue": user1@example.org/);
    assert.notMatch(output, /"stringValue": user2@example.org/);
    assert.notInclude(output, '858-555-0224');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync(
        'node deIdentifyTableWithMultipleCryptoHash.js BAD_PROJECT_ID CRYPTO_KEY_1 CRYPTO_KEY_2'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_reidentify_table_fpe
  it('should re-identify table using Format Preserving Encryption (FPE)', async () => {
    const CONSTANT_DATA = MOCK_DATA.REIDENTIFY_TABLE_WITH_FPE(
      projectId,
      'NUMERIC',
      keyName,
      wrappedKey
    );

    const mockReidentifyContent = stub()
      .resolves(CONSTANT_DATA.RESPONSE_REIDENTIFY_CONTENT);

    replace(
      DlpServiceClient.prototype,
      'reidentifyContent',
      mockReidentifyContent
    );
    replace(console, 'log', () => stub());

    const reIdentifyTableWithFpe = proxyquire('../reidentifyTableWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await reIdentifyTableWithFpe(projectId, 'NUMERIC', keyName, wrappedKey);

    _assert.calledOnceWithExactly(
      mockReidentifyContent,
      CONSTANT_DATA.REQUEST_REIDENTIFY_CONTENT
    );
  });

  it('should handle re-identification errors', async () => {
    const mockReidentifyContent = stub().rejects(new Error('Failed'));
    replace(
      DlpServiceClient.prototype,
      'reidentifyContent',
      mockReidentifyContent
    );
    replace(console, 'log', () => stub());

    const reIdentifyTableWithFpe = proxyquire('../reidentifyTableWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    try {
      await reIdentifyTableWithFpe(projectId, 'NUMERIC', keyName, wrappedKey);
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_reidentify_text_fpe
  it('should re-identify text using Format Preserving Encryption (FPE)', async () => {
    const text = 'My phone number is PHONE_TOKEN(10):9617256398';
    const CONSTANT_DATA = MOCK_DATA.REIDENTIFY_TEXT_WITH_FPE(
      projectId,
      text,
      'NUMERIC',
      keyName,
      wrappedKey,
      'PHONE_TOKEN'
    );

    const mockReidentifyContent = stub()
      .resolves(CONSTANT_DATA.RESPONSE_REIDENTIFY_CONTENT);

    replace(
      DlpServiceClient.prototype,
      'reidentifyContent',
      mockReidentifyContent
    );
    replace(console, 'log', () => stub());

    const reIdentifyTextWithFpe = proxyquire('../reidentifyTextWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await reIdentifyTextWithFpe(
      projectId,
      text,
      'NUMERIC',
      keyName,
      wrappedKey,
      'PHONE_TOKEN'
    );

    _assert.calledOnceWithExactly(
      mockReidentifyContent,
      CONSTANT_DATA.REQUEST_REIDENTIFY_CONTENT
    );
  });

  it('should handle re-identification errors', async () => {
    const mockReidentifyContent = stub().rejects(new Error('Failed'));
    const text = 'My phone number is PHONE_TOKEN(10):9617256398';
    replace(
      DlpServiceClient.prototype,
      'reidentifyContent',
      mockReidentifyContent
    );
    replace(console, 'log', () => stub());

    const reIdentifyTextWithFpe = proxyquire('../reidentifyTextWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    try {
      await reIdentifyTextWithFpe(
        projectId,
        text,
        'NUMERIC',
        keyName,
        wrappedKey,
        'PHONE_TOKEN'
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_deidentify_dictionary_replacement
  it('should replace sensitive data with replacement dict', () => {
    let output;
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';
    const replacementDict = [
      'izumi@example.com',
      'alex@example.com',
      'tal@example.com',
    ];
    try {
      output = execSync(
        `node deidentifyWithDictionaryReplacement.js ${projectId} "${string}" EMAIL_ADDRESS "${replacementDict.join(
          ','
        )}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.match(output, new RegExp(`${replacementDict.join('|')}`));
  });

  it('should handle de-identification errors', () => {
    let output;
    const replacementDict = [
      'izumi@example.com',
      'alex@example.com',
      'tal@example.com',
    ];
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';
    try {
      output = execSync(
        `node deidentifyWithDictionaryReplacement.js ${projectId} "${string}" BAD_TYPE "${replacementDict.join(
          ','
        )}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_primitive_bucketing
  it('should de-identify table using bucketing configuration', () => {
    let output;
    try {
      output = execSync(
        `node deIdentifyTableWithBucketingConfig.js ${projectId}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /"stringValue": "High"/);
    assert.match(output, /"stringValue": "Low"/);
    assert.notMatch(output, /"stringValue": "Medium"/);
    assert.notInclude(output, 'integerValue: 95');
  });

  it('should handle de-identification errors', () => {
    let output;
    try {
      output = execSync(
        'node deIdentifyTableWithBucketingConfig.js BAD_PROJECT_ID'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_replace_infotype
  it('should replace the matched input values', () => {
    let output;
    try {
      output = execSync(
        `node deIdentifyWithReplaceInfoType.js ${projectId} "My name is Alicia Abernathy, and my email address is aabernathy@example.com." "EMAIL_ADDRESS"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(
      output,
      'My name is Alicia Abernathy, and my email address is [EMAIL_ADDRESS].'
    );
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync(
        `node deIdentifyWithReplaceInfoType.js ${projectId} "My name is Alicia Abernathy, and my email address is aabernathy@example.com." "BAD_TYPE"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_cloud_storage
  it('should de-identify a cloud storage directory', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.DEIDENTIFY_CLOUD_STORAGE(
      projectId,
      inputDirectory,
      tableId,
      datasetId,
      outputDirectory,
      deidentifyTemplateId,
      structuredDeidentifyTemplateId,
      imageRedactTemplateId,
      jobName
    );
    const mockCreateDlpJob = stub().resolves([{name: jobName}]);
    replace(
      DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    replace(DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = stub();
    replace(console, 'log', mockConsoleLog);

    const deIdentifyCloudStorage = proxyquire('../deIdentifyCloudStorage', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await deIdentifyCloudStorage(
      projectId,
      inputDirectory,
      tableId,
      datasetId,
      outputDirectory,
      deidentifyTemplateId,
      structuredDeidentifyTemplateId,
      imageRedactTemplateId
    );
    _assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    _assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error if inspect cloud storage job fails', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.DEIDENTIFY_CLOUD_STORAGE(
      projectId,
      inputDirectory,
      tableId,
      datasetId,
      outputDirectory,
      deidentifyTemplateId,
      structuredDeidentifyTemplateId,
      imageRedactTemplateId,
      jobName
    );
    const mockCreateDlpJob = stub().resolves([{name: jobName}]);
    replace(
      DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_FAILED
    );
    replace(DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = stub();
    replace(console, 'log', mockConsoleLog);

    const deIdentifyCloudStorage = proxyquire('../deIdentifyCloudStorage', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await deIdentifyCloudStorage(
      projectId,
      inputDirectory,
      tableId,
      datasetId,
      outputDirectory,
      deidentifyTemplateId,
      structuredDeidentifyTemplateId,
      imageRedactTemplateId
    );
    _assert.calledOnce(mockGetDlpJob);
    _assert.calledWithMatch(
      mockConsoleLog,
      'Job Failed, Please check the configuration.'
    );
  });
});
