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
export BUCKET_NAME=$GCLOUD_PROJECT

# Configure GAE variables
export TWILIO_NUMBER="+15005550006" # public placeholder value
export TWILIO_ACCOUNT_SID=$(cat $KOKORO_GFILE_DIR/secrets-twilio-sid.txt)
export TWILIO_AUTH_TOKEN=$(cat $KOKORO_GFILE_DIR/secrets-twilio-auth-token.txt)

# Configure Cloud SQL variables
export DB_NAME="kokoro_ci"
export DB_USER="kokoro_ci"
export DB_PASS=$(cat $KOKORO_GFILE_DIR/secrets-sql-password.txt)
if [[ $SQL_CLIENT == 'pg' ]]; then
	export CONNECTION_NAME=$(cat $KOKORO_GFILE_DIR/secrets-pg-connection-name.txt)
else
	export CONNECTION_NAME=$(cat $KOKORO_GFILE_DIR/secrets-mysql-connection-name.txt)
fi

# Configure Sendgrid variables
export SENDGRID_SENDER="test@google.com"
export SENDGRID_API_KEY=$(cat $KOKORO_GFILE_DIR/secrets-sendgrid-api-key.txt)

# Configure GCF variables
export FUNCTIONS_TOPIC=integration-tests-instance
export FUNCTIONS_BUCKET=$GCLOUD_PROJECT
export BASE_URL="http://localhost:8080" # For functions-framework based tests

# Configure IoT variables
export NODEJS_IOT_EC_PUBLIC_KEY=${KOKORO_GFILE_DIR}/ec_public.pem
export NODEJS_IOT_RSA_PRIVATE_KEY=${KOKORO_GFILE_DIR}/rsa_private.pem
export NODEJS_IOT_RSA_PUBLIC_CERT=${KOKORO_GFILE_DIR}/rsa_cert.pem

cd github/nodejs-docs-samples/${PROJECT}

# Install dependencies
npm install

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GCLOUD_PROJECT

npm install -g @google-cloud/functions-framework

# Start functions emulator, if appropriate
if [[ $PROJECT == functions/* ]] && grep --quiet functions-emulator package.json; then
  export BASE_URL="http://localhost:8010/${GCLOUD_PROJECT}/${GCF_REGION}"

  export FUNCTIONS_LOG_PATH=$(pwd)/logs/cloud-functions-emulator.log
  npm install -g @google-cloud/functions-emulator
  touch "$FUNCTIONS_LOG_PATH"
  functions config set logFile "$FUNCTIONS_LOG_PATH"
  functions-emulator start
fi

npm test

exit $?
