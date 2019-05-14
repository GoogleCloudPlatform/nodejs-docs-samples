// [START containeranalysis_occurrences_for_note]
// Retrieves all the Occurrences associated with a specified Note
// Here, all Occurrences are printed and counted
const occurrencesForNote = async(
    projectId = 'your-project-id', // Your GCP Project ID
    noteId = 'my-note-id', // Id of the note
) => {
    // Import the library and create a client
    const grafeas = require('@google-cloud/grafeas');
    const client = new grafeas.v1.GrafeasClient();

    // Get path to Note
    const formattedNote = client.notePath(projectId, noteId);

    // Get occurrences
    const [occurrences] = await client.listNoteOccurrences({
        name: formattedNote
    });
    if (occurrences.length) {
        console.log('Occurrences:');
        occurrences.forEach(occurrence => {
            console.log(`${occurrence.name}:`);
            console.log(`  Created: ${new Date(occurrence.createTime.seconds * 1000)}`)
        });
    } else {
        console.log('No occurrences found.');
    }


};
// [END containeranalysis_occurrences_for_note]

const args = process.argv.slice(2);
occurrencesForNote(...args).catch(console.error);