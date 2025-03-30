#!/bin/bash -ex

# Copyright 2025 Google LLC
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

# Shared Cloud SQL Proxy setup
# Presumes the following variables in ci-setup.json:
#  * CLOUD_SQL_CONNECTION_NAME - the project:region:instance of a Cloud SQL instance.
#  * UNIX_SOCKET_DIR - a local directory to set the proxy to (default tmp/cloudsql)
#
# Note: in GitHub Actions environments, `/cloudsql` is not valid.
# Ensure any INSTANCE_UNIX_SOCKET value is ~= $UNIX_SOCKET_DIR/$CLOUD_SQL_CONNECTION_NAME

usage() {
  cat << EOF
# Usage:
#    CLOUD_SQL_CONNECTION_NAME=project:region:instance sql-proxy.sh [..]
#
# Defaults to TCP socket proxy. Set `SOCKET=unix` for Unix sockets.
#
# Usage in package.json:
#
#    "proxy": "$GITHUB_WORKSPACE/.github/workflows/utils/debug-sql-proxy.sh",
#    "system-test": "npm run proxy -- c8 mocha test/... ",
#    "system-test-unix": "SOCKET=unix npm run proxy -- c8 mocha test/... ",
EOF
}


PROXY_VERSION="v2.15.1"
SOCKET=${SOCKET:-tcp}

echop(){  # Print Echo
  echo "👾 $1"
}

exit_message() {  # Error Echo
  echo "❌ $1"
  usage()
  exit 1
}

if [[ -z "$CLOUD_SQL_CONNECTION_NAME" ]]; then
    exit_message "Must provide CLOUD_SQL_CONNECTION_NAME"
fi

if [[ $SOCKET == "unix" ]]; then
  UNIX_SOCKET_DIR=${UNIX_SOCKET_DIR:-"tmp/cloudsql"}

  if [[ $UNIX_SOCKET_DIR == "/cloudsql "]]; then
    exit_message "Cannot use /cloudsql in a GitHub Actions context"
  fi

  mkdir -p $UNIX_SOCKET_DIR && chmod 777 $UNIX_SOCKET_DIR
  socket="--unix-socket $UNIX_SOCKET_DIR"
fi
echop "Setting up cloud-sql-proxy for $SOCKET socket connections"

# Download the Cloud SQL Auth Proxy (only once)
if [[ ! -f cloud-sql-proxy ]]; then
  curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/${PROXY_VERSION}/cloud-sql-proxy.linux.amd64
  if [[ $? -ne 0 ]]; then
    echo "Failed to download cloud-sql-proxy"
    exit 1
  fi
  chmod +x cloud-sql-proxy
else
  echo "cloud-sql-proxy already downloaded"
fi

# Setup proxy
./cloud-sql-proxy $socket $CLOUD_SQL_CONNECTION_NAME &
sleep 5
echop "Proxy ready for use"

# Run whatever command was passed to this script
$@ || STATUS=$?

# Cleanup
echop "Shutting down proxy process"
pkill -f "cloud-sql-proxy"  || echo "cloud-sql-proxy process not found. Was it already stopped?"

# Fail if the tests failed
exit $STATUS
