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
gcloud components update --quiet

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GOOGLE_CLOUD_PROJECT

export NODE_ENV=development
export GCLOUD_STORAGE_BUCKET=docs-samples-${VERSION}

cd github/nodejs-docs-samples/${PROJECT}

export SERVICE_VERSION="$GITHUB_COMMIT_SHA"
export SAMPLE_NAME="$(basename $(dirname $(pwd)))"
export CLOUD_RUN_SERVICE_NAME="${SAMPLE_NAME}-${SERVICE_VERSION}"
export CONTAINER_IMAGE="gcr.io/${GOOGLE_CLOUD_PROJECT}/${SAMPLE_NAME}:${SAMPLE_VERSION}"

# Register post-test cleanup
function cleanup {
  gcloud beta --quiet run services delete "${CLOUD_RUN_SERVICE_NAME}"
  gcloud --quiet container images delete "${CONTAINER_IMAGE}"
}
trap cleanup EXIT

# Run Dockerfile linting
docker run --rm -i hadolint/hadolint < Dockerfile

# Build the service
gcloud builds submit --tag="${CONTAINER_IMAGE}"

# Deploy the service
gcloud beta run deploy "${CLOUD_RUN_SERVICE_NAME}" --image="${CONTAINER_IMAGE}"

# Capture the URL
export CLOUD_RUN_SERVICE_URL=$(gcloud beta run services describe "${CLOUD_RUN_SERVICE_NAME}" --format='value(status.domain)')

# Install dependencies and run Nodejs tests.
npm install
npm test
npm run system-test

exit $?
