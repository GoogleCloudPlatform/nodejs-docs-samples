# Copyright 2019 Google LLC. All rights reserved.
# Use of this source code is governed by the Apache 2.0
# license that can be found in the LICENSE file.

# [START run_pubsub_dockerfile]

# Use the official Node.js 10 image.
# https://hub.docker.com/_/node
FROM node:10

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
RUN npm install
# For production deploys, add a package-lock.json and use 'npm ci'.
# RUN npm ci --only=production

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]

# [END run_pubsub_dockerfile]
