#!/bin/bash
# Shell script to emulate/deploy all Cloud Functions in the file

${FUNCTIONS_CMD} deploy helloGET --trigger-http
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloHttp --trigger-http
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloBackground --trigger-topic $FUNCTIONS_TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloPubSub --trigger-topic $FUNCTIONS_TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloGCS --trigger-bucket $FUNCTIONS_BUCKET
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloGCSGeneric --trigger-bucket $FUNCTIONS_BUCKET
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloError --trigger-topic $FUNCTIONS_TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloError2 --trigger-topic $FUNCTIONS_TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloError3 --trigger-topic $FUNCTIONS_TOPIC
echo '-----------------------------'
${FUNCTIONS_CMD} deploy helloTemplate --trigger-http