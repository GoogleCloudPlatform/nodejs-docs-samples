# Getting started with Googe Cloud Memorystore
Simple HTTP server example to demonstrate connecting to [Google Cloud Memorystore](https://cloud.google.com/memorystore/docs/redis).
This sample uses the [node_redis client](https://github.com/NodeRedis/node_redis).

## Running on GCE

Follow the instructions in [this guide](https://cloud.google.com/memorystore/docs/redis/connect-redis-instance-gce) to deploy the sample application on a GCE VM.

## Running on GKE

Follow the instructions in [this guide](https://cloud.google.com/memorystore/docs/redis/connect-redis-instance-gke) to deploy the sample application on GKE.

## Running on Google App Engine Flex

Follow the instructions in [this guide](https://cloud.google.com/memorystore/docs/redis/connect-redis-instance-flex) to deploy the sample application on GAE Flex.

## Running Locally

To run this sample locally, follow these instructions:

In one terminal, [run Redis](https://redis.io/topics/quickstart):

```sh
redis-server
```

In another terminal, run the Node application:

```sh
node server.js
```

Visit the following `localhost` URL to test your server that connects to Redis and observe a persistant "Visitor number".
