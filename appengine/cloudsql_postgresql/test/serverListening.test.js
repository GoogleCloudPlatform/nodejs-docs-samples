const waitPort = require('wait-port');
const {expect} = require('chai');
const PORT = process.env.PORT || 8080;
const childProcess = require('child_process');
const path = require('path');
const appPath = path.join(__dirname, '../server.js');

describe('server listening', () => {
  it('should be listening', () => {
    const child = childProcess.spawn('node', [appPath]).on('exit', () => {
      const isOpen = waitPort({port: PORT});
      expect(isOpen).to.be.true;
      process.kill(child.pid, 'SIGTERM');
    });
  });
});
