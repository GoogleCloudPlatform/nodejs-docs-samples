// Copyright 2020 Google, LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START eventarc_audit_storage_server]
const app = require('./app.js');
const PORT = parseInt(process.env.PORT) || 8080;

app.listen(PORT, () =>
  console.log(`nodejs-events-storage listening on port ${PORT}`)
);
// [END eventarc_audit_storage_server]
