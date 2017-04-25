<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions ImageMagick sample

This sample shows you how to blur an image using ImageMagick in a
Storage-triggered Cloud Function.

View the [source code][code].

[code]: index.js

## Deploy and Test

1. Follow the [Cloud Functions quickstart guide][quickstart] to setup Cloud
Functions for your project.

1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
        cd nodejs-docs-samples/functions/imagemagick

1. Create a Cloud Storage bucket for storing images (if you already have one you
want to use, you can skip this step):

        gsutil mb gs://YOUR_BUCKET_NAME

    * Replace `YOUR_BUCKET_NAME` with the name of your image Bucket.

1. Create a Cloud Storage Bucket to stage our deployment:

        gsutil mb gs://YOUR_STAGE_BUCKET_NAME

    * Replace `YOUR_STAGE_BUCKET_NAME` with the name of your Cloud Storage Bucket.

1. Deploy the `blurOffensiveImages` function with a Storage trigger:

        gcloud alpha functions deploy blurOffensiveImages --trigger-bucket=YOUR_BUCKET_NAME --stage-bucket=YOUR_STAGE_BUCKET_NAME

    * Replace `YOUR_BUCKET_NAME` with the name of your image Cloud Storage Bucket.
    * Replace `YOUR_STAGE_BUCKET_NAME` with the name of your Cloud Storage Bucket.

1.  Upload an offensive image to your image Storage bucket, such as this image of
    a flesh-eating zombie: https://cdn.pixabay.com/photo/2015/09/21/14/24/zombie-949916_1280.jpg

1.  Check the logs for the `blurOffensiveImages` function:

        gcloud beta functions get-logs blurOffensiveImages

    You should see something like this in your console:

        D      ... User function triggered, starting execution
        I      ... `The image zombie.jpg has been detected as inappropriate.`
        D      ... Execution took 1 ms, user function completed successfully

[quickstart]: https://cloud.google.com/functions/quickstart
