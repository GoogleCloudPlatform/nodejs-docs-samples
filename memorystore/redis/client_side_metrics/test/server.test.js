// Copyright 2026 Google LLC
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

'use strict';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const {assert} = require('chai');

describe('Memorystore Redis Client-Side Metrics Sample', function () {
  this.timeout(10000);

  it('should run successfully with mocked Redis and OTLP exporters', async () => {
    // Stubs for Redis Client
    const clientStub = {
      connect: sinon.stub().resolves(),
      set: sinon.stub().resolves('OK'),
      get: sinon.stub().resolves('active'),
      on: sinon.stub(),
      quit: sinon.stub().resolves(),
    };

    const redisMock = {
      createClient: sinon.stub().returns(clientStub),
    };

    // Mocks for OTLP Exporters to avoid needing live GCP credentials in tests
    class MockTraceExporter {
      export(spans, resultCallback) {
        if (resultCallback) resultCallback({code: 0});
      }
      shutdown() {
        return Promise.resolve();
      }
      forceFlush() {
        return Promise.resolve();
      }
    }

    class MockMetricExporter {
      export(metrics, resultCallback) {
        if (resultCallback) resultCallback({code: 0});
      }
      shutdown() {
        return Promise.resolve();
      }
      forceFlush() {
        return Promise.resolve();
      }
    }

    const traceExporterMock = {
      OTLPTraceExporter: sinon.stub().returns(new MockTraceExporter()),
    };

    const metricExporterMock = {
      OTLPMetricExporter: sinon.stub().returns(new MockMetricExporter()),
    };

    // Mock for Redis Instrumentation to prevent it trying to patch the mocked Redis module
    class MockRedisInstrumentation {
      enable() {}
      disable() {}
      setTracerProvider() {}
      setMeterProvider() {}
      getConfig() {
        return {};
      }
      setConfig() {}
      getInstrumentationName() {
        return 'mock-redis';
      }
      getInstrumentationVersion() {
        return '0.0.0';
      }
      init() {}
    }

    const redisInstrumentationMock = {
      RedisInstrumentation: MockRedisInstrumentation,
    };

    const gcpDetectorMock = {
      gcpDetector: {
        detect: () => ({attributes: {}}),
      },
    };

    const googleAuthMock = {
      GoogleAuth: sinon.stub().returns({
        getProjectId: sinon.stub().resolves('test-project'),
        getRequestHeaders: sinon.stub().resolves({}),
      }),
    };

    // Load the sample with proxyquire, substituting our mocks for its top-level requires
    const {main} = proxyquire('../server.js', {
      redis: redisMock,
      '@opentelemetry/exporter-trace-otlp-grpc': traceExporterMock,
      '@opentelemetry/exporter-metrics-otlp-grpc': metricExporterMock,
      '@opentelemetry/instrumentation-redis': redisInstrumentationMock,
      '@opentelemetry/resource-detector-gcp': gcpDetectorMock,
      'google-auth-library': googleAuthMock,
    });

    // Verify top-level code executed as expected during the initial load phase
    assert.isTrue(
      redisMock.createClient.calledOnce,
      'redis.createClient should be called during load'
    );
    assert.isTrue(
      clientStub.on.calledWith('error', sinon.match.func),
      'client.on("error", ...) should be called during load'
    );
    assert.isTrue(
      traceExporterMock.OTLPTraceExporter.calledOnce,
      'OTLPTraceExporter should be instantiated during load'
    );
    assert.isTrue(
      metricExporterMock.OTLPMetricExporter.calledOnce,
      'OTLPMetricExporter should be instantiated during load'
    );

    // Run the main function and await its completion
    await main();

    // Verify main() interactions
    assert.isTrue(
      clientStub.connect.calledOnce,
      'client.connect should be called in main()'
    );
    assert.isTrue(
      clientStub.set.calledOnce,
      'client.set should be called in main() (via smartRedisCall)'
    );
    assert.isTrue(
      clientStub.get.calledOnce,
      'client.get should be called in main() (via smartRedisCall)'
    );
    assert.isTrue(
      clientStub.quit.calledOnce,
      'client.quit should be called in main()'
    );
  });
});
