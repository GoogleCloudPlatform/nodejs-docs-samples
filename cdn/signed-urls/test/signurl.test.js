'use strict';

const {signUrl} = require('../signurl');
const assert = require('node:assert/strict');

describe('signUrl', () => {
  it('should return signed url with corresponding parameters', () => {
    const url = new URL('https://cdn.example.com/test-path');
    const keyName = 'test-key-name';
    const keyValue = '0zY26LFZ2yAa3fERaKiKDQ==';
    const expirationDate = new Date();

    const resultUrl = new URL(
      signUrl(url.href, keyName, keyValue, expirationDate)
    );
    assert.strictEqual(resultUrl.hostname, url.hostname);
    assert.strictEqual(resultUrl.pathname, url.pathname);
    assert.strictEqual(resultUrl.searchParams.get('KeyName'), keyName);
    assert.strictEqual(
      resultUrl.searchParams.get('Expires'),
      Math.floor(expirationDate.valueOf() / 1000).toString()
    );
    assert.ok(resultUrl.searchParams.get('Signature'));
  });
});
