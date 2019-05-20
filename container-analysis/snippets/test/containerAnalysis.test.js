const {assert} = require('chai');
const cp = require('child_process');
const uuid = require(`uuid`);

const grafeas = require('@google-cloud/grafeas');
const client = new grafeas.v1.GrafeasClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const projectId = process.env.GCLOUD_PROJECT;
const formattedParent = `projects/${projectId}`;
const uuidVal = uuid.v4();
const noteId = `test-note-${uuidVal}`;
const formattedNoteName = `projects/${projectId}/notes/${noteId}`;
const resourceUrl = `gcr.io/project/image`;
const urlWithoutOccurrences = `gcr.io/project/nooccurrences`;
const subscriptionId = `occurrence-subscription-${uuidVal}`;
const timeoutSeconds = 5;
const tryLimit = 10;

const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const topicName = 'container-analysis-occurrences-v1beta1';
const topic = pubsub.topic(topicName);

describe('Note tests', function() {
  it('should create a note', function() {
    const output = execSync(`node createNote.js "${projectId}" "${noteId}"`);
    assert.match(output, new RegExp(`Note ${formattedNoteName} created.`));
  });

  it('should get note', function() {
    const output = execSync(`node getNote.js "${projectId}" "${noteId}"`);
    assert.match(output, new RegExp(`Note name: ${formattedNoteName}`));
  });

  it('should create occurrence', function() {
    const output = execSync(
      `node createOccurrence.js "${projectId}" "${noteId}" "${projectId}" "${resourceUrl}"`
    );
    assert.match(output, new RegExp(`Occurrence created`));
  });

  // TODO: sometimes fails, should try again if no images are found
  it('should get occurrence', async function() {
    const [occurrences] = await client.listOccurrences({
      parent: formattedParent,
    });
    assert(occurrences.length > 0);

    const occurrence = occurrences[0];
    const occurrenceId = occurrence.name.split('/')[3];
    const output = execSync(
      `node getOccurrence.js "${projectId}" "${occurrenceId}"`
    );
    assert.match(output, new RegExp(`Occurrence name: ${occurrence.name}`));
  });

  it('should get occurences for note', function() {
    const output = execSync(
      `node occurrencesForNote.js "${projectId}" "${noteId}"`
    );
    assert.match(output, /Occurrences:/);
  });

  it('should get occurrences for image', function() {
    const output = execSync(
      `node occurrencesForImage.js "${projectId}" "${resourceUrl}"`
    );
    assert.match(output, new RegExp(`Occurrences for ${resourceUrl}`));
  });

  it('should get discovery info for image', async function() {
    const discoveryNoteRequest = {
      parent: formattedParent,
      noteId: `${noteId}-discovery`,
      note: {
        discovery: {},
      },
    };

    const [discoveryNote] = await client.createNote(discoveryNoteRequest);

    const occurrenceRequest = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-discovery`,
        discovered: {
          discovered: {
            analysis_status: 'FINISHED_SUCCESS',
          },
        },
        resource: {
          uri: resourceUrl,
        },
      },
    };

    const [discoveryOccurrence] = await client.createOccurrence(
      occurrenceRequest
    );

    const output = execSync(
      `node getDiscoveryInfo "${projectId}" "${resourceUrl}"`
    );
    assert.match(
      output,
      new RegExp(`Discovery Occurrences for ${resourceUrl}`)
    );
  });

  it('should get high severity vulnerabilities for image', async function() {
    const criticalNoteReq = {
      parent: formattedParent,
      noteId: `${noteId}-critical`,
      note: {
        vulnerability: {
          severity: 'CRITICAL',
        },
      },
    };

    const [criticalNote] = await client.createNote(criticalNoteReq);

    const criticalOccurrenceReq = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-critical`,
        vulnerability: {
          vulnerability: {
            severity: 'CRITICAL',
          },
        },
        resource: {
          uri: resourceUrl,
        },
      },
    };

    const [criticalOccurrence] = await client.createOccurrence(
      criticalOccurrenceReq
    );

    const output = execSync(
      `node highVulnerabilitiesForImage "${projectId}" "${resourceUrl}"`
    );

    assert.match(
      output,
      new RegExp(`High Severity Vulnerabilities for ${resourceUrl}`)
    );
  });

  it('should get all vulnerabilites for image', function() {
    const output = execSync(
      `node vulnerabilityOccurrencesForImage "${projectId}" "${resourceUrl}"`
    );
    assert.match(output, new RegExp(`All Vulnerabilities for ${resourceUrl}`));
  });

  it('should delete occurrence', async function() {
    const [occurrences] = await client.listOccurrences({
      parent: formattedParent,
    });
    assert(occurrences.length > 0);
    const occurrence = occurrences[0];
    const occurrenceId = occurrence.name.split('/')[3];

    const output = execSync(
      `node deleteOccurrence.js "${projectId}" "${occurrenceId}"`
    );
    assert.match(output, new RegExp(`Occurrence deleted.`));
  });
  it('should delete note', function() {
    const output = execSync(`node deleteNote.js "${projectId}" "${noteId}" `);
    assert.match(output, new RegExp(`Note ${formattedNoteName} deleted.`));
  });
});

// TODO:
describe('polling', function() {
  // it('should poll api until timeout', function() {
  //     const output = execSync(`node pollDiscoveryOccurrenceFinished.js "${projectId}" "${urlWithoutOccurrences}" "${timeoutSeconds}"`);
  //     assert.match(
  //         output,
  //         new RegExp(`'Timeout while retrieving discovery occurrence.`)
  //     );
  // });

  it('should successfully poll latest discovery occurrence', function() {
    const output = execSync(
      `node pollDiscoveryOccurrenceFinished.js "${projectId}" "${resourceUrl}" "${timeoutSeconds}"`
    );
    assert.match(
      output,
      new RegExp(`Polled Discovery Occurrences for ${resourceUrl}`)
    );
  });
});
// TODO:
describe('pubsub', function() {
  beforeEach(async function() {
    const [subscription] = await topic.createSubscription(subscriptionId);
    const pubSubNoteReq = {
      parent: formattedParent,
      noteId: `${noteId}-pubsub`,
      note: {
        vulnerability: {},
      },
    };
    const [pubSubNote] = await client.createNote(pubSubNoteReq);
  });
  afterEach(async function() {
    await client.deleteNote({name: `${formattedNoteName}-pubsub`});
    await pubsub.subscription(subscriptionId).delete();
  });
  it('should get accurate count of occurrences from pubsub topic', async function() {
    const expectedNum = 3;
    const pubSubOccurrenceReq = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-pubsub`,
        vulnerability: {
          vulnerability: {},
        },
        resource: {
          uri: resourceUrl,
        },
      },
    };
    // empty subscription
    const initial = execSync(
      `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
    );

    // make sure empty
    const empty = execSync(
      `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
    );

    assert.match(empty, new RegExp(`Polled 0 occurrences`));
    // create test occurrences
    for (i = 0; i < expectedNum; i++) {
      const [pubSubOccurrence] = await client.createOccurrence(
        pubSubOccurrenceReq
      );
      // const pubSubOccurrenceId = pubSubOccurrence.name.split("/")[3];
      await client.deleteOccurrence({name: pubSubOccurrence.name});
    }
    const output = execSync(
      `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
    );

    // make sure pubsub number matches
    assert.match(output, new RegExp(`Polled ${expectedNum} occurrences`));
  });
});
