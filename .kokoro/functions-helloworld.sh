#!/bin/bash

# Copyright 2017 Google Inc.
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

export GCLOUD_PROJECT=nodejs-docs-samples
STAGE_BUCKET=$GCLOUD_PROJECT
GCP_REGION=us-central1
TOPIC=integration-test-functions
export BASE_URL=https://${GCP_REGION}-${GCLOUD_PROJECT}.cloudfunctions.net

# Configure gcloud
export GCLOUD_PROJECT=nodejs-getting-started-tests
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project nodejs-getting-started-tests

function cleanup {
  CODE=$?

  gcloud beta functions delete helloworld -q
  gcloud beta functions delete helloGET -q
  gcloud beta functions delete helloBackground -q
  gcloud beta functions delete helloPubSub -q
  gcloud beta functions delete helloGCS -q
  gcloud beta functions delete helloError -q
  gcloud beta functions delete helloError2 -q
  gcloud beta functions delete helloError3 -q
  gcloud beta functions delete helloTemplate -q
}
trap cleanup EXIT

set -e

# Deploy all hello-world functions
# (If any step fails, the entire test run should fail)
gcloud beta functions deploy helloworld --trigger-http --stage-bucket $STAGE_BUCKET
gcloud beta functions deploy helloGET --trigger-http --stage-bucket $STAGE_BUCKET
gcloud beta functions deploy helloBackground --stage-bucket $STAGE_BUCKET --trigger-topic $TOPIC
gcloud beta functions deploy helloPubSub --stage-bucket $STAGE_BUCKET --trigger-topic $TOPIC
gcloud beta functions deploy helloGCS --stage-bucket $STAGE_BUCKET --trigger-bucket integration-test-functions
gcloud beta functions deploy helloError --stage-bucket $STAGE_BUCKET --trigger-topic $TOPIC
gcloud beta functions deploy helloError2 --stage-bucket $STAGE_BUCKET --trigger-topic $TOPIC
gcloud beta functions deploy helloError3 --stage-bucket $STAGE_BUCKET --trigger-topic $TOPIC
gcloud beta functions deploy helloTemplate --stage-bucket $STAGE_BUCKET --trigger-http

# Run system tests
repo-tools test