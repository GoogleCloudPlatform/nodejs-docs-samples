'use strict';

// [START nodejs_cdn_signed_urls]
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
// [END nodejs_cdn_signed_urls]

module.exports = {
  signUrl,
};
