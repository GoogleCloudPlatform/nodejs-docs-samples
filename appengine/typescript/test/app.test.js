const waitPort = require('wait-port');
const {expect} = require('chai');

const PORT = parseInt(process.env.PORT) || 8080;

describe('server listening', () => {
  it('should be listening', async () => {
    const server = require('../index.js');
    const returnObject = await waitPort({port: PORT});
    expect(returnObject.open).to.be.true;
    server.close();
  });
});
