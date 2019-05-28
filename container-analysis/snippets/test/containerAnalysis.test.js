const {assert} = require('chai');
const cp = require('child_process');
const uuid = require(`uuid`);

const containerAnalysis = require('@google-cloud/containeranalysis');
const client = new containerAnalysis.v1beta1.GrafeasV1Beta1Client();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const uuidVal = uuid.v4();
const noteId = `test-note-${uuidVal}`;
const resourceUrl = `gcr.io/test-project/test-image-${uuidVal}`;
const subscriptionId = `occurrence-subscription-${uuidVal}`;
const timeoutSeconds = 5;
const retries = 5;

const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const topicName = 'container-analysis-occurrences-v1beta1';
const topic = pubsub.topic(topicName);

let projectId;
let formattedParent;
let formattedNoteName;

describe('Note tests', function() {
  before(async function() {
    // define projectId and related vars
    projectId = await client.getProjectId();
    formattedParent = `projects/${projectId}`;
    formattedNoteName = `projects/${projectId}/notes/${noteId}`;
  });
  after(async function() {
    const [allOccurrences] = await client.listOccurrences({
      parent: formattedParent,
      filter: `resourceUrl = "${resourceUrl}"`,
    });

    allOccurrences.forEach(async occurrence => {
      await client.deleteOccurrence({name: occurrence.name});
      console.log(`deleted occurrence ${occurrence.name}`);
    });

    const [allNotes] = await client.listNotes({
      parent: formattedParent,
    });

    allNotes.forEach(async note => {
      await client.deleteNote({name: note.name});
      console.log(`deleted note ${note.name}`);
    });
  });
  it('should create a note', function() {
    const output = execSync(`node createNote.js "${projectId}" "${noteId}"`);
    assert.include(output, new RegExp(`Note ${formattedNoteName} created.`));
  });

  it('should get note', function() {
    const output = execSync(`node getNote.js "${projectId}" "${noteId}"`);
    assert.include(output, new RegExp(`Note name: ${formattedNoteName}`));
  });

  it('should create occurrence', function() {
    const output = execSync(
      `node createOccurrence.js "${projectId}" "${noteId}" "${projectId}" "${resourceUrl}"`
    );
    assert.include(output, new RegExp(`Occurrence created`));
  });

  it('should get occurrence', async function() {
    const [occurrences] = await client.listOccurrences({
      parent: formattedParent,
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

    assert.include(output, new RegExp(`Occurrence name: ${occurrence.name}`));
  });

  it('should get occurences for note', function() {
    const output = execSync(
      `node occurrencesForNote.js "${projectId}" "${noteId}"`
    );
    assert.include(output, /Occurrences:/);
  });

  it('should get occurrences for image', function() {
    const output = execSync(
      `node occurrencesForImage.js "${projectId}" "${resourceUrl}"`
    );
    assert.include(output, new RegExp(`Occurrences for ${resourceUrl}`));
  });

  it('should get discovery info for image', async function() {
    const discoveryNoteRequest = {
      parent: formattedParent,
      noteId: `${noteId}-discovery`,
      note: {
        discovery: {},
      },
    };

    await client.createNote(discoveryNoteRequest);

    const occurrenceRequest = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-discovery`,
        discovered: {
          discovered: {
            analysisStatus: 'FINISHED_SUCCESS',
          },
        },
        resource: {
          uri: resourceUrl,
        },
      },
    };

    await client.createOccurrence(occurrenceRequest);

    const output = execSync(
      `node getDiscoveryInfo "${projectId}" "${resourceUrl}"`
    );
    assert.include(
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

    await client.createNote(criticalNoteReq);

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

    await client.createOccurrence(criticalOccurrenceReq);

    const output = execSync(
      `node highVulnerabilitiesForImage "${projectId}" "${resourceUrl}"`
    );

    assert.include(
      output,
      new RegExp(`High Severity Vulnerabilities for ${resourceUrl}`)
    );
  });

  it('should get all vulnerabilites for image', function() {
    const output = execSync(
      `node vulnerabilityOccurrencesForImage "${projectId}" "${resourceUrl}"`
    );
    assert.include(output, new RegExp(`All Vulnerabilities for ${resourceUrl}`));
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
    assert.include(output, new RegExp(`Occurrence deleted.`));
  });
  it('should delete note', function() {
    const output = execSync(`node deleteNote.js "${projectId}" "${noteId}" `);
    assert.include(output, new RegExp(`Note ${formattedNoteName} deleted.`));
  });
});

// eslint-disable-next-line no-warning-comments
// TODO: complete polling sample
xdescribe('polling', function() {
  before(async function() {
    // define project id and related vars
    projectId = await client.getProjectId();
    formattedParent = `projects/${projectId}`;
    formattedNoteName = `projects/${projectId}/notes/${noteId}`;

    const discoveryNoteRequest = {
      parent: formattedParent,
      noteId: `${noteId}-discovery-polling`,
      note: {
        discovery: {
          continuousAnalysis: 'INACTIVE',
        },
      },
    };

    await client.createNote(discoveryNoteRequest);

    const occurrenceRequest = {
      parent: formattedParent,
      occurrence: {
        noteName: `${formattedNoteName}-discovery-polling`,
        discovered: {
          discovered: {
            analysisStatus: 'FINISHED_SUCCESS',
          },
        },
      },
      resource: {
        uri: resourceUrl,
      },
    };

    await client.createOccurrence(occurrenceRequest);
  });

  after(async function() {
    const [discoveryOccurrences] = await client.listNoteOccurrences({
      name: `${formattedNoteName}-discovery-polling`,
    });
    discoveryOccurrences.forEach(async occurrence => {
      await client.deleteOccurrence({name: occurrence.name});
    });
    await client.deleteNote({name: `${formattedNoteName}-discovery-polling`});
  });

  it('should successfully poll latest discovery occurrence', function() {
    const output = execSync(
      `node pollDiscoveryOccurrenceFinished.js "${projectId}" "${resourceUrl}" "${timeoutSeconds}"`
    );
    assert.include(
      output,
      new RegExp(`Polled Discovery Occurrences for ${resourceUrl}`)
    );
  });
});

describe('pubsub', function() {
  before(async function() {
    // define project id and related vars
    projectId = await client.getProjectId();
    formattedParent = `projects/${projectId}`;
    formattedNoteName = `projects/${projectId}/notes/${noteId}`;
  });

  beforeEach(async function() {
    await topic.createSubscription(subscriptionId);
    const pubSubNoteReq = {
      parent: formattedParent,
      noteId: `${noteId}-pubsub`,
      note: {
        vulnerability: {},
      },
    };
    await client.createNote(pubSubNoteReq);
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
    execSync(
      `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
    );

    // make sure empty
    const empty = execSync(
      `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
    );

    assert.include(empty, new RegExp(`Polled 0 occurrences`));
    // create test occurrences
    for (let i = 0; i < expectedNum; i++) {
      const [pubSubOccurrence] = await client.createOccurrence(
        pubSubOccurrenceReq
      );
      await client.deleteOccurrence({name: pubSubOccurrence.name});
    }
    const output = execSync(
      `node occurrencePubSub.js "${projectId}" "${subscriptionId}" "${timeoutSeconds}"`
    );

    // make sure pubsub number matches
    assert.include(output, new RegExp(`Polled ${expectedNum} occurrences`));
  });
});
