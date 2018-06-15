#!/bin/bash

# Copyright 2018 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e;

export GCLOUD_PROJECT=nodejs-docs-samples-tests

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GCLOUD_PROJECT

export NODE_ENV=development
export GAE_VERSION=doc-sample-$(echo $PROJECT | sed 's_/_-_g')

# Register post-test cleanup
function cleanup {
  gcloud app versions delete $GAE_VERSION --quiet
  if [ -e "worker.yaml" ]; then
    gcloud app versions delete ${GAE_VERSION}-worker --quiet
  fi
}
trap cleanup EXIT


cd github/nodejs-docs-samples/${PROJECT}

# Install dependencies
npm install

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GCLOUD_PROJECT


# Deploy the app
gcloud app deploy --version $GAE_VERSION --no-promote --quiet
if [ -e "worker.yaml" ]; then
  gcloud app deploy worker.yaml --version ${GAE_VERSION} --no-promote --quiet
fi


# Test the deployed app
npm test

exit $?