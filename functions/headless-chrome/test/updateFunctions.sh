#!/bin/bash
# Shell script to emulate/deploy all Cloud Functions in the file

${FUNCTIONS_CMD} deploy screenshot --trigger-http --runtime nodejs8 --memory 1024MB