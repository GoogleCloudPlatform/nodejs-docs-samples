const {Storage} = require('@google-cloud/storage');
const {format} = require('date-fns');

// local
const gcsOutputBucket =
  'example-cloud-bucket-5439474/nodejs-docs-samples-tests';

//uncomment
// const gcsOutputBucket = "nodejs-docs-samples-tests";

module.exports.createOutputGcsUri = async function () {
  const prefix = `text_output/${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`;
  const gcsUri = `gs://${gcsOutputBucket}/${prefix}`;

  return {
    uri: gcsUri,
    async cleanup() {
      const storage = new Storage();
      const bucket = storage.bucket(gcsOutputBucket);

      const [files] = await bucket.getFiles({prefix});
      await Promise.all(files.map(file => file.delete()));
      console.log(`Deleted ${files.length} files from ${prefix}`);
    },
  };
};
