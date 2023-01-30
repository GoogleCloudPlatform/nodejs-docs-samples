const waitPort = require('wait-port');
const {expect} = require('chai');
const PORT = parseInt(parseInt(process.env.PORT)) || 8080;
const childProcess = require('child_process');
const path = require('path');
const appPath = path.join(__dirname, '../app.js');

describe('server listening', () => {
  it('should be listening', async () => {
    const child = childProcess.exec(`node ${appPath}`);
    const returnObject = await waitPort({port: PORT});
    expect(returnObject.open).to.be.true;
    process.kill(child.pid, 'SIGTERM');
  });
});
