// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');
const {delay} = require('./util');
const uuid = require('uuid');

const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
const client = new ContainerAnalysisClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const uuidVal = uuid.v4();
const noteId = `test-note-${uuidVal}`;
const resourceUrl = `gcr.io/test-project/test-image-${uuidVal}`;
const subscriptionId = `occurrence-subscription-${uuidVal}`;
const timeoutSeconds = 5;
const retries = 10;

const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const topicName = 'container-analysis-occurrences-v1';
let topic;

let projectId;
let formattedParent;
let formattedNoteName;

describe.skip('Note tests', () => {
  before(async () => {
    // define projectId and related vars
    projectId = await client.getProjectId();
    formattedParent = `projects/${projectId}`;
    formattedNoteName = `projects/${projectId}/notes/${noteId}`;
  });
  after(async () => {
    const [allOccurrences] = await client.getGrafeasClient().listOccurrences({
      parent: formattedParent,
      filter: `resourceUrl = "${resourceUrl}"`,
    });

    allOccurrences.forEach(async occurrence => {
      await client.getGrafeasClient().deleteOccurrence({name: occurrence.name});
      console.log(`deleted occurrence ${occurrence.name}`);
    });

    const [allNotes] = await client.getGrafeasClient().listNotes({
      parent: formattedParent,
    });

    allNotes.forEach(async note => {
      await client.getGrafeasClient().deleteNote({name: note.name});
      console.log(`deleted note ${note.name}`);
    });
  });
  it('should create a note', () => {
    const output = execSync(`node createNote.js "${projectId}" "${noteId}"`);
    assert.include(output, `Note ${formattedNoteName} created.`);
  });

  it('should get note', () => {
    const output = execSync(`node getNote.js "${projectId}" "${noteId}"`);
    assert.include(output, `Note name: ${formattedNoteName}`);
  });

  it('should create occurrence', () => {
    const output = execSync(
      `node createOccurrence.js "${projectId}" "${noteId}" "${projectId}" "${resourceUrl}"`
    );
    assert.include(output, 'Occurrence created');
  });

  it('should get occurrence', async () => {
    const [occurrences] = await client.getGrafeasClient().listOccurrences({
      parent: formattedParent,
      filter: `resourceUrl = "${resourceUrl}"`,
    });
    assert(occurrences.length > 0);

    const occurrence = occurrences[0];
    const occurrenceId = occurrence.name.split('/')[3];
    let output;
    for (let i = 0; i < retries; i++) {
      output = execSync(
        `node getOccurrence.js "${projectId}" "${occurrenceId}"`
      );
      if (output.includes('Occurrence name:')) {
        break;
      }
    }
    assert.include(output, `Occurrence name: ${occurrence.name}`);
  });

  it('should get occurrences for note', () => {
    let output;
    for (let i = 0; i < retries; i++) {
      output = execSync(
        `node occurrencesForNote.js "${projectId}" "${noteId}"`
      );
      if (!output.includes('No occurrences found.')) {
        break;
      }
    }
    assert.include(output, 'Occurrences:');
  });

  it('should get occurrences for image', () => {
    const output = execSync(
      `node occurrencesForImage.js "${projectId}" "${resourceUrl}"`
    );
    assert.include(output, `Occurrences for ${resourceUrl}`);
  });

  it('should get discovery info for image', async () => {
    const discoveryNoteRequest = {
      parent: formattedParent,
      noteId: `${noteId}-discovery`,
      note: {
        discovery: {
          analysisKind: 'DISCOVERY',
        },
      },
    };

    await client.getGrafeasClient().createNote(discoveryNoteRequest);

    const occurrenceRequest = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-discovery`,
        resourceUri: resourceUrl,
        discovery: {
          analysisStatus: 'FINISHED_SUCCESS',
        },
      },
    };

    await client.getGrafeasClient().createOccurrence(occurrenceRequest);

    const output = execSync(
      `node getDiscoveryInfo "${projectId}" "${resourceUrl}"`
    );
    assert.include(output, `Discovery Occurrences for ${resourceUrl}`);
  });

  it('should get high severity vulnerabilities for image', async () => {
    const criticalNoteReq = {
      parent: formattedParent,
      noteId: `${noteId}-critical`,
      note: {
        vulnerability: {
          severity: 'CRITICAL',
          details: [
            {
              affectedCpeUri: 'foo.uri',
              affectedPackage: 'foo',
              affectedVersionStart: {
                kind: 'MINIMUM',
              },
              affectedVersionEnd: {
                kind: 'MAXIMUM',
              },
            },
          ],
        },
      },
    };

    await client.getGrafeasClient().createNote(criticalNoteReq);

    const criticalOccurrenceReq = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-critical`,
        resourceUri: resourceUrl,
        vulnerability: {
          effective_severity: 'CRITICAL',
          packageIssue: [
            {
              affectedCpeUri: 'foo.uri',
              affectedPackage: 'foo',
              affectedVersion: {
                kind: 'MINIMUM',
              },
              fixedVersion: {
                kind: 'MAXIMUM',
              },
            },
          ],
        },
      },
    };

    await client.getGrafeasClient().createOccurrence(criticalOccurrenceReq);

    const output = execSync(
      `node highVulnerabilitiesForImage "${projectId}" "${resourceUrl}"`
    );

    assert.include(output, `High Severity Vulnerabilities for ${resourceUrl}`);
  });

  it('should get all vulnerabilites for image', () => {
    const output = execSync(
      `node vulnerabilityOccurrencesForImage "${projectId}" "${resourceUrl}"`
    );
    assert.include(output, `All Vulnerabilities for ${resourceUrl}`);
  });

  it('should delete occurrence', async () => {
    const [occurrences] = await client.getGrafeasClient().listOccurrences({
      parent: formattedParent,
      filter: `resourceUrl = "${resourceUrl}"`,
    });
    assert(occurrences.length > 0);
    const occurrence = occurrences[0];
    const occurrenceId = occurrence.name.split('/')[3];

    const output = execSync(
      `node deleteOccurrence.js "${projectId}" "${occurrenceId}"`
    );
    assert.include(output, 'Occurrence deleted:');
  });

  it('should delete note', () => {
    const output = execSync(`node deleteNote.js "${projectId}" "${noteId}" `);
    assert.include(output, `Note ${formattedNoteName} deleted.`);
    // Sometimes the delete note test is failing with the error:
    // Error: 5 NOT_FOUND: note with ID "test-note-${uuid}" for project
    // ${projectId} does not exist.
  });
});

describe.skip('polling', () => {
  before(async () => {
    // define project id and related vars
    projectId = await client.getProjectId();
    formattedParent = `projects/${projectId}`;
    formattedNoteName = `projects/${projectId}/notes/${noteId}`;

    const discoveryNoteRequest = {
      parent: formattedParent,
      noteId: `${noteId}-discovery-polling`,
      note: {
        discovery: {
          analysisKind: 'DISCOVERY',
        },
      },
    };

    await client.getGrafeasClient().createNote(discoveryNoteRequest);

    const occurrenceRequest = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-discovery-polling`,
        resourceUri: resourceUrl,
        discovery: {
          analysisStatus: 'FINISHED_SUCCESS',
        },
      },
    };

    await client.getGrafeasClient().createOccurrence(occurrenceRequest);
  });

  after(async () => {
    const [discoveryOccurrences] = await client
      .getGrafeasClient()
      .listNoteOccurrences({
        name: `${formattedNoteName}-discovery-polling`,
      });
    discoveryOccurrences.forEach(async occurrence => {
      await client.getGrafeasClient().deleteOccurrence({name: occurrence.name});
    });
    await client
      .getGrafeasClient()
      .deleteNote({name: `${formattedNoteName}-discovery-polling`});
  });

  it('should successfully poll latest discovery occurrence', () => {
    const output = execSync(
      `node pollDiscoveryOccurrenceFinished.js "${projectId}" "${resourceUrl}" "${timeoutSeconds}"`
    );
    assert.include(output, 'Found discovery occurrence');
  });
});

describe.skip('pubsub', () => {
  before(async () => {
    // define project id and related vars
    projectId = await client.getProjectId();
    formattedParent = `projects/${projectId}`;
    formattedNoteName = `projects/${projectId}/notes/${noteId}`;
    topic = pubsub.topic(topicName);
  });

  describe('occurrences from pubsub subscription', () => {
    it('should get count of occurrences from pubsub topic', async function () {
      this.retries(3);
      await delay(this.test);
      try {
        // attempt to create topic if missing
        await pubsub.createTopic(topicName);
      } catch (err) {
        console.log(`topic creation failed: ${topicName} ${err.message}`);
        if (!err.details.includes('Resource already exists')) {
          throw err;
        }
      }
      try {
        await topic.createSubscription(subscriptionId);
      } catch (err) {
        console.log(
          `subscription creation failed: ${subscriptionId} ${err.message}`
        );
        if (!err.details.includes('Resource already exists')) {
          throw err;
        }
      }
      const pubSubNoteReq = {
        parent: formattedParent,
        noteId: `${noteId}-pubsub`,
        note: {
          vulnerability: {
            details: [
              {
                affectedCpeUri: 'foo.uri',
                affectedPackage: 'foo',
                affectedVersionStart: {
                  kind: 'MINIMUM',
                },
                affectedVersionEnd: {
                  kind: 'MAXIMUM',
                },
              },
            ],
          },
        },
      };
      await client.getGrafeasClient().createNote(pubSubNoteReq);
      const occurrenceCount = 3;
      const pubSubOccurrenceReq = {
        parent: formattedParent,
        occurrence: {
          noteName: `${formattedNoteName}-pubsub`,
          resourceUri: resourceUrl,
          vulnerability: {
            packageIssue: [
              {
                affectedCpeUri: 'foo.uri',
                affectedPackage: 'foo',
                affectedVersion: {
                  kind: 'MINIMUM',
                },
                fixedVersion: {
                  kind: 'MAXIMUM',
                },
              },
            ],
          },
        },
      };

      // empty subscription
      execSync(
        `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
      );

      // create test occurrences
      for (let i = 0; i < occurrenceCount; i++) {
        const [pubSubOccurrence] = await client
          .getGrafeasClient()
          .createOccurrence(pubSubOccurrenceReq);
        await client
          .getGrafeasClient()
          .deleteOccurrence({name: pubSubOccurrence.name});
      }
      const output = execSync(
        `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
      );

      // ensure that our occcurences were enqueued:
      assert.match(output, /Polled [1-9]+ occurrences/);
    });

    it('should delete the pubsub subscription', async function () {
      this.retries(3);
      await delay(this.test);

      try {
        await client
          .getGrafeasClient()
          .deleteNote({name: `${formattedNoteName}-pubsub`});
      } catch (err) {
        assert.fail(err);
      }

      try {
        await pubsub.subscription(subscriptionId).delete();
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});
