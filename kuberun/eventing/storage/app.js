// Copyright 2021 Google LLC.
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

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { HTTP, CloudEvent } = require('cloudevents');
const { toStorageObjectData } = require('@google/events/cloud/storage/v1/StorageObjectData');

const app = express();

app.use(express.json());
app.post('/', (req, res) => {
  try {
    const receivedEvent = HTTP.toEvent({ headers: req.headers, body: req.body });
    const storageObjectData = toStorageObjectData(receivedEvent.data);
    console.log(`Detected change in Cloud Storage bucket: ${storageObjectData.bucket}, object name: ${storageObjectData.name}`);
  } catch (error) {
    return res.status(400).send('Invalid cloudevent');
  }

  // reply with a cloudevent
  const replyEvent = new CloudEvent({
    id: uuidv4(),
    type: 'com.example.kuberun.events.received',
    source: 'https://localhost',
    specversion: '1.0',
  });
  replyEvent.data = {
    message: "Event received"
  }

  const message = HTTP.binary(replyEvent);
  return res.header(message.headers).status(200).send(message.body);
});

module.exports = app;
