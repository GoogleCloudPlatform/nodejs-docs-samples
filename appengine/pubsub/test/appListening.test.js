const waitPort = require('wait-port');
const {expect} = require('chai');
const PORT = process.env.PORT || 8080;
const childProcess = require('child_process');

describe('server listening', () => {
  it('should be listening', async () => {
    const child = await childProcess.exec('node app.js');
    const isOpen = await waitPort({port: PORT});
    expect(isOpen).to.be.true;
    process.kill(child.pid, 'SIGTERM');
  });
});
