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

set -eo pipefail

_run_error_log() {
  echo "error: line $(caller)"
}

trap '_run_error_log' ERR

# Activate mocha config
export MOCHA_REPORTER_OUTPUT=${PROJECT}_sponge_log.xml
export MOCHA_REPORTER=xunit
pushd github/nodejs-docs-samples
mv .kokoro/.mocharc.js .
popd

export GOOGLE_CLOUD_PROJECT=nodejs-docs-samples-tests
pushd github/nodejs-docs-samples/${PROJECT}

# Update gcloud
gcloud --quiet components update
gcloud --quiet components install beta

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GOOGLE_CLOUD_PROJECT

#  run/websockets
export REDISHOST=$(cat $KOKORO_GFILE_DIR/secrets-memorystore-redis-ip.txt)
export REDISPORT=6379

# Version is in the format <PR#>-<GIT COMMIT SHA>.
# Ensures PR-based triggers of the same branch don't collide if Kokoro attempts
# to run them concurrently. Defaults to 'latest'.
RAW_SAMPLE_VERSION="${KOKORO_GIT_COMMIT:-latest}"
export SAMPLE_VERSION="${RAW_SAMPLE_VERSION:0:15}"
export SAMPLE_NAME="$(basename $(pwd))"

# Cloud Run has a max service name length, $KOKORO_BUILD_ID is too long to guarantee no conflict deploys.
set -x
export SUFFIX="$(cat /dev/urandom | LC_CTYPE=C tr -dc 'a-z0-9' | head -c 15)"
set +x
export SERVICE_NAME="${SAMPLE_NAME}-${SUFFIX}"

# Install dependencies and run Nodejs tests.
export NODE_ENV=development
npm install

# If tests are running against main, configure FlakyBot
# to open issues on failures:
if [[ $KOKORO_BUILD_ARTIFACTS_SUBDIR = *"release"* ]]; then
	export MOCHA_REPORTER_SUITENAME=${PROJECT}
	notify_flakybot() {
		chmod +x $KOKORO_GFILE_DIR/linux_amd64/flakybot
		$KOKORO_GFILE_DIR/linux_amd64/flakybot
	}
	trap notify_flakybot EXIT HUP
fi

# Configure Cloud SQL variables for deploying idp-sql sample
export DB_NAME="kokoro_ci"
export DB_USER="kokoro_ci"
export DB_PASSWORD=$(cat $KOKORO_GFILE_DIR/secrets-sql-password.txt)
export CLOUD_SQL_CONNECTION_NAME=$(cat $KOKORO_GFILE_DIR/secrets-pg-connection-name.txt)

export IDP_KEY=$(gcloud secrets versions access latest --secret="nodejs-docs-samples-idp-key" --project="${GOOGLE_CLOUD_PROJECT}")

npm test
npm run --if-present system-test
