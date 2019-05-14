const { assert } = require('chai');
const cp = require('child_process');
const uuid = require(`uuid`);

const grafeas = require('@google-cloud/grafeas');
const client = new grafeas.v1.GrafeasClient();

const execSync = cmd => cp.execSync(cmd, { encoding: 'utf-8' });

const projectId = process.env.GCLOUD_PROJECT;
const formattedParent = `projects/${projectId}`;
const noteId = `test-note-${uuid.v4()}`;
const formattedNoteName = `projects/${projectId}/notes/${noteId}`;
const resourceUrl = `gcr.io/project/image`;


describe('Note tests', async function () {
    it('should create a note', async function () {
        const output = execSync(`node createNote.js "${projectId}" "${noteId}"`);
        assert.match(
            output,
            new RegExp(`Note ${formattedNoteName} created.`)
        );
    });

    it('should get note', async function () {
        const output = execSync(`node getNote.js "${projectId}" "${noteId}"`);
        assert.match(
            output,
            new RegExp(`Note name: ${formattedNoteName}`)
        );
    });

    it('should create occurrence', async function () {
        const output = execSync(`node createOccurrence.js "${projectId}" "${noteId}" "${projectId}" "${resourceUrl}"`);
        assert.match(
            output,
            new RegExp(`Occurrence created`)
        )

    });

    it('should get occurrence', async function () {
        const [occurrences] = await client.listOccurrences({
            parent: formattedParent
        });
        assert(occurrences.length > 0);

        const occurrence = occurrences[0];
        const occurrenceId = occurrence.name.split("/")[3];

        const output = execSync(`node getOccurrence.js "${projectId}" "${occurrenceId}"`);
        assert.match(
            output,
            new RegExp(`Occurrence name: ${occurrence.name}`)
        );
    });

    it('should get occurences for note', async function () {
        const output = execSync(`node occurrencesForNote.js "${projectId}" "${noteId}"`);
        assert.match(output, /Occurrences:/);
    });

    it('should get occurrences for image', async function() {
        const output = execSync(`node occurrencesForImage.js "${projectId}" "${resourceUrl}"`);
        assert.match(
            output,
            new RegExp(`Occurrences for ${resourceUrl}`)
        );
    });

    // TODO:
    it('should get discovery info for image', async function() {
        // TODO: create discovery note and occurrence
        const discoveryNoteRequest = {
            parent: formattedParent,
            noteId: `${noteId}-discovery`,
            note: {
                discovery: {}
            }
        };

        const [discoveryNote] = await client.createNote(discoveryNoteRequest);

        const occurrenceRequest = {
            parent: formattedParent,
            occurrence: {
                noteName: `${formattedNoteName}-discovery`,
                discovered: {
                    discovered: {
                        analysis_status: 'FINISHED_SUCCESS'
                    },
                },
                resource: {
                    uri: resourceUrl
                }
            }
        }

        const [discoveryOccurrence] = await client.createOccurrence(occurrenceRequest)

        const output = execSync(`node getDiscoveryInfo "${projectId}" "${resourceUrl}"`);
        assert.match(
            output,
            new RegExp(`Discovery Occurrences for ${resourceUrl}`)
        );
    });

    it('should delete occurrence', async function () {
        const [occurrences] = await client.listOccurrences({
            parent: formattedParent
        });
        assert(occurrences.length > 0);
        const occurrence = occurrences[0];
        const occurrenceId = occurrence.name.split("/")[3];

        const output = execSync(`node deleteOccurrence.js "${projectId}" "${occurrenceId}"`);
        assert.match(
            output,
            new RegExp(`Occurrence deleted.`)
        );
    });
    ;

    it('should delete note', async function () {
        const output = execSync(`node deleteNote.js "${projectId}" "${noteId}" `);
        assert.match(
            output,
            new RegExp(`Note ${formattedNoteName} deleted.`)
        );
    });

});

// describe('Occurrence tests', async function() {
//     it('should create occurrence', async function() {
//         const output = execSync(`node createOccurrence.js "${projectId}" "${noteId}"`);
//         assert.match(
//             output,
//             new RegExp(`Occurrence created.`)
//         )
//     });
//     // TODO: finalize inputs

//     // TODO: 
//     it('should delete occurrence', async function() {
//         const output = execSync(`node deleteOccurrence.js`);
//         assert.match(
//             output,
//             new RegExp(`Occurrence deleted.`)
//         )
//     });
//     // TODO:
//     it('should get occurences for note', async function() {
//         const output = execSync(`node occurrencesForNote.js`);
//         assert.match(output, /Occurrences:/);
//     });
// });
// // TODO:
// describe('image queries', async function() {
//     it('should get occurrences for image', async function() {
//         const output = execSync(`node occurrencesForImage.js`);
//         assert.match(
//             output,
//             new RegExp(``)
//         );
//     });

//     it('should get high vulnerabilities for image', async function() {
//         const output = execSync(`node highVulnerabilitiesForImage`);
//         assert.match(
//             output,
//             new RegExp(``)
//         );
//     });

//     it('should get all vulnerabilites for image', async function() {
//         const output = execSync(`node vulnerabilityOccurrencesForImage`);
//         assert.match(
//             output,
//             new RegExp(``)
//         );
//     });

//     it('should get discovery info for image', async function() {
//         const output = execSync(`node getDiscoveryInfo`);
//         assert.match(
//             output,
//             new RegExp(``)
//         );
//     });
// });
// // TODO:
// describe('polling', async function() {
//     it('should poll api until timeout', async function() {
//         const output = execSync(`node pollDiscoveryOccurrenceFinished.js`);
//         assert.match(
//             output,
//             new RegExp(``)
//         );
//     });

//     it('should successfully poll latest discovery occurrence', async function() {
//         const output = execSync(`node pollDiscoveryOccurrenceFinished.js`);
//         assert.match(
//             output,
//             new RegExp(``)
//         );
//     });

// });
// // TODO: 
// describe('pubsub', async function() {
//     it('should get accurate count of occurrences from pubsub topic', async function() {
//         const output = execSync(`node pubSub.js`);
//         assert.match(
//             output,
//             new RegExp(``)
//         );
//     });
// });
