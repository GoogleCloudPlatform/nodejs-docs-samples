/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

import {RecaptchaEnterpriseServiceClient} from '@google-cloud/recaptcha-enterprise';
import {assert} from 'chai';
import {after, before, describe, it} from 'mocha';
import * as cp from 'child_process';
import {google} from '@google-cloud/recaptcha-enterprise/build/protos/protos';
import recaptchaenterprise = google.cloud.recaptchaenterprise.v1;
import IntegrationType = google.cloud.recaptchaenterprise.v1.WebKeySettings.IntegrationType;

const client: RecaptchaEnterpriseServiceClient =
  new RecaptchaEnterpriseServiceClient();
const execSync = (cmd: string) => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Test for password leak given username and password', () => {
  let PROJECT_ID: string,
    SITE_KEY: string,
    USERNAME: string,
    PASSWORD: string,
    stdout: string;

  before(async () => {
    PROJECT_ID = await client.getProjectId();
    //  Create site key.
    const webKeySettings: recaptchaenterprise.IWebKeySettings = {
      integrationType: IntegrationType.SCORE,
      allowedDomains: ['localhost'],
      allowAmpTraffic: false,
    };
    const keyObject: recaptchaenterprise.IKey = {
      displayName: 'test_key',
      webSettings: webKeySettings,
    };
    const createKeyRequest: recaptchaenterprise.ICreateKeyRequest = {
      parent: client.projectPath(PROJECT_ID),
      key: keyObject,
    };
    const [response] = await client.createKey(createKeyRequest);
    const keyName: string = response.name!;
    SITE_KEY = keyName.substring(keyName.lastIndexOf('/') + 1);

  });

  after(async () => {
    // Delete site key.
    const deleteKeyRequest: recaptchaenterprise.IDeleteKeyRequest = {
      name: client.keyPath(PROJECT_ID, SITE_KEY),
    };
    await client.deleteKey(deleteKeyRequest);
    console.log('reCAPTCHA Site key successfully deleted !');
  });

  it('should obtain boolean result from password leak assessment call', async () => {
    stdout = execSync(
      `node --loader ts-node/esm passwordLeakAssessment.ts 
        ${PROJECT_ID} ${SITE_KEY}, ${USERNAME} ${PASSWORD}`
    );
    assert.match(stdout, /Hashes created/);
  });
});
