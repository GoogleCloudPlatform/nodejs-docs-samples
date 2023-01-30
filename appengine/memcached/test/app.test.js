const {expect} = require('chai');
const waitPort = require('wait-port');

const PORT = parseInt(parseInt(process.env.PORT)) || 8080;

describe('gae_flex_redislabs_memcache', () => {
  it('should be listening', async () => {
    const server = require('../app.js');
    const returnObject = await waitPort({port: PORT});
    expect(returnObject.open).to.be.true;
    server.close();
  });
});
