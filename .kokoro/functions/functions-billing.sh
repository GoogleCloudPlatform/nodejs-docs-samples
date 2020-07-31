#!/bin/bash

# Copyright 2019, Google LLC.
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
      
export GOOGLE_CLOUD_PROJECT=cdpe-functions-billing-test

export GCF_REGION=us-central1
export NODE_ENV=development

# Configure Slack variables
export BOT_ACCESS_TOKEN=$(cat ${KOKORO_GFILE_DIR}/secrets-slack-bot-access-token.txt)
export CHANNEL=$(cat ${KOKORO_GFILE_DIR}/secrets-slack-channel-id.txt)
export BILLING_ACCOUNT=$(cat ${KOKORO_GFILE_DIR}/secrets-billing-account-id.txt)

cd github/nodejs-docs-samples/${PROJECT}

# Install dependencies
npm install

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GOOGLE_CLOUD_PROJECT

npm run ${TEST_CMD}

exit $?
