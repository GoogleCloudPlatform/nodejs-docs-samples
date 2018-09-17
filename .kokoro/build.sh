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
      
export GCLOUD_PROJECT=nodejs-docs-samples-tests
export GCF_REGION=us-central1
export NODE_ENV=development

export FUNCTIONS_TOPIC=integration-tests-instance
export FUNCTIONS_BUCKET=$GCLOUD_PROJECT
export BASE_URL="http://localhost:8010/${GCLOUD_PROJECT}/${GCF_REGION}"

cd github/nodejs-docs-samples/${PROJECT}

# Install dependencies
npm install

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GCLOUD_PROJECT

# Start functions emulator, if appropriate
if [[ $PROJECT == functions/* ]]; then
  export FUNCTIONS_LOG_PATH=$(pwd)/logs/cloud-functions-emulator.log
  npm install -g @google-cloud/functions-emulator
  touch "$FUNCTIONS_LOG_PATH"
  functions config set logFile "$FUNCTIONS_LOG_PATH"
  functions-emulator start
fi

npm test

exit $?
