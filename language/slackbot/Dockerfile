# Copyright 2016 Google Inc. All Rights Reserved.
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

FROM node:5.4

RUN apt-get update
RUN apt-get install -y sqlite3

# Install app dependencies.
COPY package.json /src/package.json
WORKDIR /src
RUN npm install

# Bundle app source.
COPY demo_bot.js /src

CMD ["node", "/src/demo_bot.js"]
