const waitPort = require('wait-port');
const {expect} = require('chai');
const PORT = process.env.PORT || 8080;
const childProcess = require('child_process');
const path = require('path');
const appPath = path.join(__dirname, '../server.js');

describe('server listening', () => {
  it('should be listening', async () => {
    const child = childProcess.exec(`node ${appPath}`);
    const isOpen = await waitPort({port: PORT});
    expect(isOpen).to.be.true;
    process.stdout.write(`sql user: ${process.env.SQL_USER},
      password: ${process.env.SQL_PASSWORD},
      database: ${process.env.SQL_DATABASE}`);
    try {
      process.kill(child.pid, 'SIGTERM');
      // eslint-disable-next-line no-empty
    } catch (err) {}
    try {
      child.kill('SIGTERM');
      // eslint-disable-next-line no-empty
    } catch (err) {}
  });
});
