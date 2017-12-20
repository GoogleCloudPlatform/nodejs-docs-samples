#!/bin/bash
# Shell script to emulate/deploy all Cloud Functions in the file

${FUNCTIONS_CMD} deploy helloGET --trigger-http
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloHttp --trigger-http
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloBackground --trigger-topic $TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloPubSub --trigger-topic $TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloGCS --trigger-bucket $BUCKET
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloError --trigger-topic $TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloError2 --trigger-topic $TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloError3 --trigger-topic $TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloTemplate --trigger-http