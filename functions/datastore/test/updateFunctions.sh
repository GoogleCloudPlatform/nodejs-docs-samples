#!/bin/bash
# Shell script to emulate/deploy all Cloud Functions in the file

${FUNCTIONS_CMD} deploy set --trigger-http
echo '-----------------------------'
${FUNCTIONS_CMD} deploy get --trigger-http
echo '-----------------------------'
${FUNCTIONS_CMD} deploy del --trigger-http
