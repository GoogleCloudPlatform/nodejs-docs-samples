// Copyright 2019 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

const app = require('./app.js');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`graphviz-web listening on port ${PORT}`));
