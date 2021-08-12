# Cloud Run Image Processing Sample

This sample service applies [Cloud Storage](https://cloud.google.com/storage/docs)-triggered image processing with [Cloud Vision API](https://cloud.google.com/vision/docs) analysis and ImageMagick transformation.

Use it with the [Image Processing with Cloud Run tutorial](http://cloud.google.com/run/docs/tutorials/image-processing).

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/run).

## Dependencies

* **express**: Web server framework
* **[gm](https://github.com/aheckmann/gm#readme)**: ImageMagick integration library.
* **@google-cloud/storage**: Google Cloud Storage client library.
* **@google-cloud/vision**: Cloud Vision API client library.

## Environment Variables

Cloud Run services can be [configured with Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables).
Required variables for this sample include:

* `INPUT_BUCKET_NAME`: The Cloud Run service will be notified of images uploaded to this Cloud Storage bucket. The service will then retreive and process the image.
* `BLURRED_BUCKET_NAME`: The Cloud Run service will write blurred images to this Cloud Storage bucket.

## Maintenance Note

* The `image.js` file is copied from the [Cloud Functions ImageMagick sample `index.js`](../../functions/imagemagick/index.js). Region tags are changed.
* The package.json dependencies used in the copied code should track the [Cloud Functions ImageMagick `package.json`](../../functions/imagemagick/package.json)

```sh
cp ../../functions/imagemagick/index.js image.js
sed -i '' 's/functions_imagemagick_setup/run_imageproc_handler_setup/' image.js
sed -i '' 's/functions_imagemagick_analyze/run_imageproc_handler_analyze/' image.js
sed -i '' 's/functions_imagemagick_blur/run_imageproc_handler_blur/' image.js
```
