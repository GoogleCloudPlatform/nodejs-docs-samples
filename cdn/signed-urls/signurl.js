// Copyright 2025 Google LLC
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

// [START cloudcdn_sign_url]
const crypto = require('crypto');

/**
 * Sign url to access Google Cloud CDN resource secured by key.
 * @param url the Cloud CDN endpoint to sign
 * @param keyName name of the signing key configured in the backend service/bucket
 * @param keyValue value of the signing key
 * @param expirationDate the date that the signed URL expires
 * @return signed CDN URL
 */
function signUrl(url, keyName, keyValue, expirationDate) {
  const urlObject = new URL(url);
  urlObject.searchParams.set(
    'Expires',
    Math.floor(expirationDate.valueOf() / 1000).toString()
  );
  urlObject.searchParams.set('KeyName', keyName);

  const signature = crypto
    .createHmac('sha1', Buffer.from(keyValue, 'base64'))
    .update(urlObject.href)
    .digest('base64url');
  urlObject.searchParams.set('Signature', signature);

  return urlObject.href;
}
// [END cloudcdn_sign_url]

module.exports = {
  signUrl,
};
