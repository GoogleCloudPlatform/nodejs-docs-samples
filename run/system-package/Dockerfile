# Copyright 2019 Google LLC. All rights reserved.
# Use of this source code is governed by the Apache 2.0
# license that can be found in the LICENSE file.

# Use the official super-lightweight Node image.
# https://hub.docker.com/_/node
FROM node:10-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# [START run_system_package_alpine]
RUN apk --no-cache add graphviz ttf-ubuntu-font-family
# [END run_system_package_alpine]

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
# If you add a package-lock.json speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]
