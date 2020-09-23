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
      
export GOOGLE_CLOUD_PROJECT=nodejs-docs-samples-tests

export GCF_REGION=us-central1
export NODE_ENV=development
export BUCKET_NAME=$GOOGLE_CLOUD_PROJECT

# Configure GAE variables
export TWILIO_NUMBER="+15005550006" # public placeholder value
export TWILIO_ACCOUNT_SID=$(cat $KOKORO_GFILE_DIR/secrets-twilio-sid.txt)
export TWILIO_AUTH_TOKEN=$(cat $KOKORO_GFILE_DIR/secrets-twilio-auth-token.txt)

# Configure Cloud SQL variables
export DB_NAME="kokoro_ci"
export DB_USER="kokoro_ci"
export DB_PASS=$(cat $KOKORO_GFILE_DIR/secrets-sql-password.txt)
if [[ $SQL_CLIENT == 'pg' ]]; then
	export INSTANCE_CONNECTION_NAME=$(cat $KOKORO_GFILE_DIR/secrets-pg-connection-name.txt)
elif [[ $SQL_CLIENT == 'sqlserver' ]]; then
	export INSTANCE_CONNECTION_NAME=$(cat $KOKORO_GFILE_DIR/secrets-sqlserver-connection-name.txt)
elif [[ $SQL_CLIENT == 'mysql' ]]; then
	export INSTANCE_CONNECTION_NAME=$(cat $KOKORO_GFILE_DIR/secrets-mysql-connection-name.txt)
fi


# Configure Sendgrid variables
export SENDGRID_SENDER="test@google.com"
export SENDGRID_API_KEY=$(cat $KOKORO_GFILE_DIR/secrets-sendgrid-api-key.txt)

# Configure GCF variables
export FUNCTIONS_TOPIC=integration-tests-instance
export FUNCTIONS_BUCKET=$GOOGLE_CLOUD_PROJECT
export FUNCTIONS_DELETABLE_BUCKET=$GOOGLE_CLOUD_PROJECT-functions

#  functions/speech-to-speech
export OUTPUT_BUCKET=$FUNCTIONS_BUCKET

#  functions/memorystore/redis
export REDISHOST=$(cat $KOKORO_GFILE_DIR/secrets-memorystore-redis-ip.txt)
export REDISPORT=6379

#  functions/translate
export SUPPORTED_LANGUAGE_CODES="en,es"
export TRANSLATE_TOPIC=$FUNCTIONS_TOPIC
export RESULT_TOPIC=$FUNCTIONS_TOPIC
export RESULT_BUCKET=$FUNCTIONS_BUCKET

# functions/ocr (reuses some stuff from functions/translate)
export TO_LANG="en,es"

#  functions/imagemagick
export BLURRED_BUCKET_NAME=$GOOGLE_CLOUD_PROJECT-imagick

# Configure IoT variables
export NODEJS_IOT_EC_PUBLIC_KEY=${KOKORO_GFILE_DIR}/ec_public.pem
export NODEJS_IOT_RSA_PRIVATE_KEY=${KOKORO_GFILE_DIR}/rsa_private.pem
export NODEJS_IOT_RSA_PUBLIC_CERT=${KOKORO_GFILE_DIR}/rsa_cert.pem

# Configure Slack variables (for functions/slack sample)
export BOT_ACCESS_TOKEN=${KOKORO_GFILE_DIR}/secrets-slack-bot-access-token.txt
export CHANNEL=${KOKORO_GFILE_DIR}/secrets-slack-channel-id.txt

# Activate mocha config
export MOCHA_REPORTER_OUTPUT=${PROJECT}_sponge_log.xml
export MOCHA_REPORTER=xunit
pushd github/nodejs-docs-samples
mv .kokoro/.mocharc.js .
popd

cd github/nodejs-docs-samples/${PROJECT}

# Install dependencies
npm install

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GOOGLE_CLOUD_PROJECT

# Download and run the proxy if testing a Cloud SQL sample
if [[ $SQL_CLIENT ]]; then
	wget --quiet https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
	chmod +x cloud_sql_proxy	
	if [[ $SQL_CLIENT == 'sqlserver' ]]; then
		./cloud_sql_proxy -instances="${INSTANCE_CONNECTION_NAME}"=tcp:1433 &>> cloud_sql_proxy.log &
	elif [[ $SQL_CLIENT == 'mysql' ]]; then
		export DB_HOST=127.0.0.1:3306
		./cloud_sql_proxy -instances="${INSTANCE_CONNECTION_NAME}"=tcp:3306 &>> cloud_sql_proxy.log &
	else
		export DB_HOST=127.0.0.1:5432
		./cloud_sql_proxy -instances="${INSTANCE_CONNECTION_NAME}"=tcp:5432 &>> cloud_sql_proxy.log &
	fi
fi

# If tests are running against master, configure Build Cop
# to open issues on failures:
if [[ $KOKORO_BUILD_ARTIFACTS_SUBDIR = *"release"* ]]; then
	export MOCHA_REPORTER_SUITENAME=${PROJECT}
	cleanup() {
	chmod +x $KOKORO_GFILE_DIR/linux_amd64/buildcop
	$KOKORO_GFILE_DIR/linux_amd64/buildcop
	}
	trap cleanup EXIT HUP
fi

npm test

exit $?
