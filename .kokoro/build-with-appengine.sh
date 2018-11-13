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

# Update gcloud
gcloud components update --quiet

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GCLOUD_PROJECT

export NODE_ENV=development

# Strip appengine and flexible/standard from version string.
VERSION=$(echo $PROJECT | sed 's_appengine/__')
VERSION=$(echo $VERSION | sed 's_/flexible\|/standard__')

export GAE_VERSION=$VERSION
export GCLOUD_STORAGE_BUCKET=docs-samples-${VERSION}

# Register post-test cleanup
function cleanup {
  gcloud app versions delete $GAE_VERSION --quiet
}
trap cleanup EXIT


cd github/nodejs-docs-samples/${PROJECT}


# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GCLOUD_PROJECT


# Deploy the app
gcloud app deploy --version $GAE_VERSION --no-promote --quiet


# Install dependencies and run tests
npm install
npm test

exit $?
