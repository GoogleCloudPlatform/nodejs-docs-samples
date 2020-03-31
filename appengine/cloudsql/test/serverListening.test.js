const {server} = require('../server.js');
const waitPort = require('wait-port');
const {expect} = require('chai');

describe('server listening', () => {
  it('should be listening', async () => {
    const isOpen = await waitPort({port: 8080});
    console.log(`is open?${await isOpen}`);
    expect(await isOpen).to.be.true;
    server.close();
  });
});
