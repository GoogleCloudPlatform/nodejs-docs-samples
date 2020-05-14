const waitPort = require('wait-port');
const {expect} = require('chai');

const PORT = process.env.PORT || 8080;

describe('gae_flex_redislabs_memcache', () => {
  it('should be listening', async () => {
    const server = require('../app.js');
    const isOpen = await waitPort({port: PORT});
    expect(isOpen).to.be.true;
    server.close();
  });
});
