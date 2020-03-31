const waitPort = require('wait-port');
const {expect} = require('chai');

describe('server listening', () => {
  it('should be listening', async () => {
    require('../server.js');
    const isOpen = await waitPort({port: 8080});
    expect(isOpen).to.be.true;
  });
});
