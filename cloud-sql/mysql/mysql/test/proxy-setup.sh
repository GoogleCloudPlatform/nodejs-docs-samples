#!/bin/bash -e

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

# Proof of concept: setting up proxy

PROXY_VERSION="v2.15.1"
SETUP_STYLE=${1:-tcp}

if [[ $SETUP_STYLE -ne "tcp" ]]; then
  mkdir cloudsql && chmod 777 cloudsql
  socket="--unix-socket /cloudsql"
fi

if [[ -! f cloud-sql-proxy ]]; then

  curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/${PROXY_VERSION}/cloud-sql-proxy.linux.amd64
  if [[ $? -ne 0 ]]; then
    echo "Failed to download cloud-sql-proxy"
    exit 1
  fi
  chmod +x cloud-sql-proxy
else
  echo "cloud-sql-proxy already downloaded"
fi

./cloud-sql-proxy $CLOUD_SQL_CONNECTION_NAME $socket &
sleep 10
