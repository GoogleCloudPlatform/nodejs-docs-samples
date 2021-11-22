// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const assert = require('assert');
const {request} = require('gaxios');
const {exec} = require('child_process');
const waitPort = require('wait-port');

const startFF = async (target, signature, port) => {
  const ff = exec(
    `npx functions-framework --target=${target} --signature-type=${signature} --port=${port}`
  );
  await waitPort({host: 'localhost', port});
  return ff;
};

const getFFOutput = ffProc => {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    ffProc.stdout.on('data', data => (stdout += data));
    ffProc.stderr.on('data', data => (stderr += data));

    ffProc.on('error', reject).on('exit', code => {
      code === 0 ? resolve(stdout) : reject(stderr);
    });
  });
};

const invocation = (port, event) => {
  const baseUrl = `http://localhost:${port}`;
  return request({
    url: `${baseUrl}/`,
    method: 'POST',
    data: event,
  });
};

describe('functions_cloudevent_pubsub', () => {
  const PORT = 9081;
  let ffProc;
  let ffProcHandler;

  before(async () => {
    ffProc = await startFF('helloPubSub', 'cloudevent', PORT);
    ffProcHandler = getFFOutput(ffProc);
  });

  after(() => {
    // Stop any residual Functions Framework instances
    try {
      ffProc.kill();
    } finally {
      /* Do nothing */
    }
  });

  it('should process a CloudEvent', async () => {
    const event = {
      data: {
        message: 'd29ybGQ=', // 'World' in base 64
      },
    };
    const response = await invocation(PORT, event);
    ffProc.kill();

    const output = await ffProcHandler;

    assert.strictEqual(response.status, 204);
    assert.strictEqual(output.includes('Hello, World!'), true);
  });
});

describe('functions_cloudevent_storage', () => {
  const PORT = 9082;
  let ffProc;
  let ffProcHandler;

  before(async () => {
    ffProc = await startFF('helloGCS', 'cloudevent', PORT);
    ffProcHandler = getFFOutput(ffProc);
  });

  after(() => {
    // Stop any residual Functions Framework instances
    try {
      ffProc.kill();
    } finally {
      /* Do nothing */
    }
  });

  it('should process a CloudEvent', async () => {
    const event = {
      id: '1234',
      type: 'mock-gcs-event',
      data: {
        bucket: 'my-bucket',
        name: 'my-file.txt',
      },
    };
    const response = await invocation(PORT, event);
    ffProc.kill();

    const output = await ffProcHandler;
    console.log();

    assert.strictEqual(response.status, 204);
    assert.match(output, /Event ID: 1234/);
    assert.match(output, /Event Type: mock-gcs-event/);
    assert.match(output, /Bucket: my-bucket/);
    assert.match(output, /File: my-file\.txt/);
  });
});

describe('functions_log_cloudevent', () => {
  const PORT = 9083;
  let ffProc;
  let ffProcHandler;

  before(async () => {
    ffProc = await startFF('helloAuditLog', 'cloudevent', PORT);
    ffProcHandler = getFFOutput(ffProc);
  });

  after(() => {
    // Stop any residual Functions Framework instances
    try {
      ffProc.kill();
    } finally {
      /* Do nothing */
    }
  });

  it('should process a CloudEvent', async () => {
    const event = {
      type: 'google.cloud.audit.log.v1.written',
      subject:
        'storage.googleapis.com/projects/_/buckets/my-bucket/objects/test.txt',
      data: {
        protoPayload: {
          methodName: 'storage.objects.write',
          authenticationInfo: {
            principalEmail: 'example@example.com',
          },
          resourceName: 'some-resource',
        },
      },
    };
    const response = await invocation(PORT, event);
    ffProc.kill();

    const output = await ffProcHandler;

    assert.strictEqual(response.status, 204);
    assert.match(output, /API method: storage\.objects\.write/);
    assert.match(output, /Event type: google.cloud.audit.log.v1.written/);
    assert.match(
      output,
      /Subject: storage.googleapis.com\/projects\/_\/buckets\/my-bucket\/objects\/test\.txt/
    );
    assert.match(output, /Resource name: some-resource/);
    assert.match(output, /Principal: example@example\.com/);
  });
});

describe('functions_label_gce_instance', () => {
  const PORT = 9084;
  let ffProc;
  let ffProcHandler;

  before(async () => {
    ffProc = await startFF('autoLabelInstance', 'cloudevent', PORT);
    ffProcHandler = getFFOutput(ffProc);
  });

  after(() => {
    // Stop any residual Functions Framework instances
    try {
      ffProc.kill();
    } finally {
      /* Do nothing */
    }
  });

  it('should validate data', async () => {
    const event = {
      subject: 'invalid/subject/example',
    };
    const response = await invocation(PORT, event);
    ffProc.kill();

    await ffProcHandler;
    assert.match(response.data, /Invalid event structure/);
  });
});
