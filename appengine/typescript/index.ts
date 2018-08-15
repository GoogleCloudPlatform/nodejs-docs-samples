// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* tslint:disable:no-console */

declare var process: {
  env: {
      PORT: string,
  },
};

const PORT: number = Number(process.env.PORT) || 8080;
import express = require("express");

const app: any = express();

app.get("/", (req: any, res: any) => {
  res.send("🎉 Hello TypeScript! 🎉");
});

const server: object = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
