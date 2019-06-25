#!/bin/bash

# Copyright 2019 Google LLC.
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

export GOOGLE_CLOUD_PROJECT=nodejs-docs-samples-tests

# Update gcloud
gcloud --quiet components update
gcloud --quiet components install beta

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GOOGLE_CLOUD_PROJECT

cd github/nodejs-docs-samples/${PROJECT}

# Version is in the format <PR#>-<GIT COMMIT SHA>.
# Ensures PR-based triggers of the same branch don't collide if Kokoro attempts
# to run them concurrently.
export SERVICE_VERSION="${KOKORO_GITHUB_PULL_REQUEST_NUMBER}-${KOKORO_GIT_COMMIT}"
export SAMPLE_NAME="$(basename $(dirname $(pwd)))"
export CLOUD_RUN_SERVICE_NAME="${SAMPLE_NAME}-${SERVICE_VERSION}"
export CONTAINER_IMAGE="gcr.io/${GOOGLE_CLOUD_PROJECT}/${SAMPLE_NAME}:${SAMPLE_VERSION}"

# Register post-test cleanup
function cleanup {
  gcloud --quiet container images delete "${CONTAINER_IMAGE}"
}
trap cleanup EXIT

# Build the service
gcloud builds submit --tag="${CONTAINER_IMAGE}"

# Install dependencies and run Nodejs tests.
export NODE_ENV=development
npm install
npm test
npm run | grep e2e-test && npm run e2e-test

exit $?
