# Copyright 2023 Google LLC
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

# This file is only used for packaging and deployment purposes.

FROM node:16-slim

ARG GOOGLE_CLOUD_PROJECT
ENV GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}

ARG SITE_KEY
ENV SITE_KEY=${SITE_KEY}

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install production dependencies.
RUN npm install
