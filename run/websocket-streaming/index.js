// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/********************** NOTE **********************
 * This sample will not work if concurrency is > 1
 * in Cloud Run! This is because the sample is only
 * configured to create websockets for one client.
 **************************************************/

// [START functions_tips_chunked_download]
// [START cloudrun_tips_chunked_download]
const fs = require('fs');
const path = require('path');

// [START functions_tips_chunked_upload]
// [START cloudrun_tips_chunked_upload]
const uuidv4 = require('uuid').v4;
const WebSocket = require('ws');

const express = require('express');
const app = express();

const FileType = require('file-type');

const port = process.env.PORT || 8080;

// [END functions_tips_chunked_upload]
// [END cloudrun_tips_chunked_upload]

// This function downloads a file in chunks with Websockets.
// This allows for sending files that are bigger than the
// instance's available memory.
const wsServer = new WebSocket.Server({ noServer: true, path: '/ws' });

app.get('/download', (req, res) => {
  // Generate file to download
  res.sendFile('download.html', {root: __dirname });
});

// Send file chunks over a websocket connection
wsServer.on('connection', downloadWs => {
  const filePath = path.join(__dirname, 'resources/cat.jpg');
  const data = fs.readFileSync(filePath);

  // TODO(developer): adjust this based on your
  // application's maximum request size.
  // For Cloud Run applications, this is 32 MB
  // Smaller chunk sizes have lower (peak) compute needs
  // at the cost of higher latencies.
  const CHUNK_SIZE = 1024 * 1024; // 1 MB

  // Chunk and send binary data
  // (In this case, we're sending *from* Cloud Run.)
  for (let i = 0; i < data.byteLength; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE)
      downloadWs.send(chunk);
  }

  // Send an end-of-transmission message
  downloadWs.send('EOM');
});

// [END functions_tips_chunked_download]
// [END cloudrun_tips_chunked_download]

// app.get('/view', async (req, res) => {
//   if (displayedBytes.length == 0) {
//     res.send('No image uploaded!');
//     return;
//   }

//   const displayedBuffer = Buffer.from(displayedBytes, 'binary');

//   console.log(displayedBytes.length)
//   //console.log(await FileType.fromBuffer(displayedBuffer))


//   const mime = 'image/jpeg';//await FileType.fromBuffer(displayedBuffer);
//   const base64data = displayedBuffer.toString('base64');
//   res.send(`<img src='data:${mime};base64${base64data}'>`);
// });

// [START functions_tips_chunked_upload]
// [START cloudrun_tips_chunked_upload]

// This function uploads a chunked file via Websockets.
// This lets you process files that are bigger than the
// instance's available memory.

app.get('/upload', async (req, res) => {
  res.sendFile('upload.html', {root: __dirname })
});

// Receive file chunks over a Websocket connection.
wsServer.on('connection', uploadWs => {
  uploadWs.on('message', chunk => {
    // Chunk received
    // TODO(developer): process the chunk
    console.log('Chunk length:', chunk.length);
  });
});

// [START functions_tips_chunked_download]
// [START cloudrun_tips_chunked_download]

const server = app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
// [END functions_tips_chunked_download]
// [END cloudrun_tips_chunked_download]
// [END functions_tips_chunked_upload]
// [END cloudrun_tips_chunked_upload]
