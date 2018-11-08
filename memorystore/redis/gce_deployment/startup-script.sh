#! /bin/bash

# Copyright 2018 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# [START memorystore_startup_script_sh]
set -ex

# Talk to the metadata server to get the project id and location of application binary.
PROJECTID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/project/project-id" -H "Metadata-Flavor: Google")
GCS_BUCKET_NAME=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/gcs-bucket" -H "Metadata-Flavor: Google")
REDISHOST=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/redis-host" -H "Metadata-Flavor: Google")
REDISPORT=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/redis-port" -H "Metadata-Flavor: Google")

# Install dependencies from apt
apt-get update
# Install Node.js 9
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
apt-get install -yq ca-certificates supervisor nodejs build-essential


# Install logging monitor. The monitor will automatically pickup logs send to
# syslog.
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash
service google-fluentd restart &

gsutil cp gs://"$GCS_BUCKET_NAME"/gce/app.tar /app.tar
mkdir -p /app
tar -x -f /app.tar -C /app
cd /app
# Install the app dependencies
npm install

# Create a nodeapp user. The application will run as this user.
getent passwd nodeapp || useradd -m -d /home/nodeapp nodeapp
chown -R nodeapp:nodeapp /app

# Configure supervisor to run the Go app.
cat >/etc/supervisor/conf.d/nodeapp.conf << EOF
[program:nodeapp]
directory=/app
environment=HOME="/home/nodeapp",USER="nodeapp",REDISHOST=$REDISHOST,REDISPORT=$REDISPORT
command=node server.js
autostart=true
autorestart=true
user=nodeapp
stdout_logfile=syslog
stderr_logfile=syslog
EOF

supervisorctl reread
supervisorctl update
# [END memorystore_startup_script_sh]
