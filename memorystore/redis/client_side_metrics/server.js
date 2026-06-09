/**
 * Copyright 2026 Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START memorystore_redis_client_side_metrics]

'use strict';

const { trace, metrics } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { MetricExporter } = require('@google-cloud/opentelemetry-cloud-monitoring-exporter');
const { RedisInstrumentation } = require('@opentelemetry/instrumentation-redis-4');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { performance } = require('perf_hooks');

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new BatchSpanProcessor(new TraceExporter()));
provider.register();

registerInstrumentations({
  instrumentations: [new RedisInstrumentation()]
});

const redis = require('redis');

const metricExporter = new MetricExporter();
const metricReader = new PeriodicExportingMetricReader({ exporter: metricExporter, exportIntervalMillis: 10000 });
const meterProvider = new MeterProvider({ readers: [metricReader] });
metrics.setGlobalMeterProvider(meterProvider);

const tracer = trace.getTracer('redis.client.node');
const meter = metrics.getMeter('redis.metrics.node');

const rttHist = meter.createHistogram('redis_client_rtt', { unit: 'ms' });
const appBlockHist = meter.createHistogram('redis_application_blocking_latency', { unit: 'ms' });
const retryCounter = meter.createCounter('redis_retry_count');
const connErrorCounter = meter.createCounter('redis_connectivity_error_count');

retryCounter.add(0, { operation: 'startup' });
connErrorCounter.add(0, { operation: 'startup' });

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const client = redis.createClient({
  socket: {
    host: REDISHOST,
    port: REDISPORT,
    reconnectStrategy: (retries) => {
      connErrorCounter.add(1, { error: 'socket_reconnect' });
      if (retries > 5) return new Error('Max retries reached');
      return Math.min(retries * 100, 3000);
    }
  }
});
client.on('error', (err) => console.log('Redis Client Error', err));

async function smartRedisCall(operationName, func, ...args) {
  let attempt = 0;
  while (attempt < 3) {
    try {
      const reqStart = performance.now();
      const response = await func(...args);
      rttHist.record(performance.now() - reqStart, { operation: operationName });

      const appParseStart = performance.now();
      const _ = String(response);
      appBlockHist.record(performance.now() - appParseStart, { operation: operationName });

      return response;
    } catch (e) {
      attempt++;
      retryCounter.add(1, { operation: operationName });
      if (attempt >= 3) throw e;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
}

async function main() {
  await client.connect();

  await tracer.startActiveSpan('process_user_span', async (span) => {
    try {
      // Simple write and read operations
      await smartRedisCall('set_user', client.set.bind(client), 'user:123', 'active');

      const result = await smartRedisCall('get_user', client.get.bind(client), 'user:123');
      console.log('Retrieved:', result);
    } catch (e) {
      span.recordException(e);
    } finally {
      span.end();
    }
  });

  await client.quit();
  await provider.forceFlush();
  await meterProvider.forceFlush();
}

main().catch(console.error);
// [END memorystore_redis_client_side_metrics]
