[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Google Cloud Storage: Node.js Samples](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/storage)

[![Open in Cloud Shell][shell_img]][shell_link]

> Node.js idiomatic client for [Cloud Storage][product-docs].

[Cloud Storage](https://cloud.google.com/storage/docs) allows world-wide
storage and retrieval of any amount of data at any time. You can use Google
Cloud Storage for a range of scenarios including serving website content,
storing data for archival and disaster recovery, or distributing large data
objects to users via direct download.

## Table of Contents

* [Before you begin](#before-you-begin)
* [Samples](#samples)
  * [Add Bucket Conditional Binding](#add-bucket-conditional-binding)
  * [Add Bucket Default Owner Acl](#add-bucket-default-owner-acl)
  * [Add Bucket Iam Member](#add-bucket-iam-member)
  * [Storage Add Bucket Label.](#storage-add-bucket-label.)
  * [Add Bucket Owner Acl](#add-bucket-owner-acl)
  * [Bucket Website Configuration.](#bucket-website-configuration.)
  * [Add File Owner Acl](#add-file-owner-acl)
  * [Storage Get Bucket Metadata.](#storage-get-bucket-metadata.)
  * [Change Bucket's Default Storage Class.](#change-bucket's-default-storage-class.)
  * [Storage File Convert CSEK to CMEK.](#storage-file-convert-csek-to-cmek.)
  * [Storage Combine files.](#storage-combine-files.)
  * [Storage Configure Bucket Cors.](#storage-configure-bucket-cors.)
  * [Configure Retries](#configure-retries)
  * [Copy File](#copy-file)
  * [Copy Old Version Of File.](#copy-old-version-of-file.)
  * [Create a Dual-Region Bucket](#create-a-dual-region-bucket)
  * [Create a hierarchical namespace enabled bucket](#create-a-hierarchical-namespace-enabled-bucket)
  * [Create a Bucket with object retention enabled.](#create-a-bucket-with-object-retention-enabled.)
  * [Create Bucket With Storage Class and Location.](#create-bucket-with-storage-class-and-location.)
  * [Create Bucket With Turbo Replication](#create-bucket-with-turbo-replication)
  * [Create New Bucket](#create-new-bucket)
  * [Create Notification](#create-notification)
  * [Delete Bucket](#delete-bucket)
  * [Delete File](#delete-file)
  * [Delete Notification](#delete-notification)
  * [Delete Old Version Of File.](#delete-old-version-of-file.)
  * [Disable Bucket Lifecycle Management](#disable-bucket-lifecycle-management)
  * [Storage Disable Bucket Versioning.](#storage-disable-bucket-versioning.)
  * [Disable Default Event Based Hold](#disable-default-event-based-hold)
  * [Disable Requester Pays](#disable-requester-pays)
  * [Disable Soft Delete](#disable-soft-delete)
  * [Disable Uniform Bucket Level Access](#disable-uniform-bucket-level-access)
  * [Download Byte Range](#download-byte-range)
  * [Download Encrypted File](#download-encrypted-file)
  * [Download File](#download-file)
  * [Download a File in Chunks With Transfer Manager](#download-a-file-in-chunks-with-transfer-manager)
  * [Download File Using Requester Pays](#download-file-using-requester-pays)
  * [Download Folder With Transfer Manager](#download-folder-with-transfer-manager)
  * [Download Into Memory](#download-into-memory)
  * [Download Many Files With Transfer Manager](#download-many-files-with-transfer-manager)
  * [Storage Download Public File.](#storage-download-public-file.)
  * [Enable Bucket Lifecycle Management](#enable-bucket-lifecycle-management)
  * [Storage Enable Bucket Versioning.](#storage-enable-bucket-versioning.)
  * [Enable Default Event Based Hold](#enable-default-event-based-hold)
  * [Enable Default KMS Key](#enable-default-kms-key)
  * [Enable Requester Pays](#enable-requester-pays)
  * [Enable Uniform Bucket Level Access](#enable-uniform-bucket-level-access)
  * [Change File's Storage Class.](#change-file's-storage-class.)
  * [Storage Set File Metadata.](#storage-set-file-metadata.)
  * [Generate Encryption Key](#generate-encryption-key)
  * [Generate Signed Url](#generate-signed-url)
  * [Generate V4 Read Signed Url](#generate-v4-read-signed-url)
  * [Generate V4 Signed Policy](#generate-v4-signed-policy)
  * [Generate V4 Upload Signed Url](#generate-v4-upload-signed-url)
  * [Get Autoclass](#get-autoclass)
  * [Get Default Event Based Hold](#get-default-event-based-hold)
  * [Get Metadata](#get-metadata)
  * [Get Metadata Notifications](#get-metadata-notifications)
  * [Get Public Access Prevention](#get-public-access-prevention)
  * [Get RPO](#get-rpo)
  * [Get Requester Pays Status](#get-requester-pays-status)
  * [Get Retention Policy](#get-retention-policy)
  * [Storage Get Service Account.](#storage-get-service-account.)
  * [Get Soft Delete Policy](#get-soft-delete-policy)
  * [Get Soft Deleted Bucket](#get-soft-deleted-bucket)
  * [Get Uniform Bucket Level Access](#get-uniform-bucket-level-access)
  * [Activate HMAC SA Key.](#activate-hmac-sa-key.)
  * [Create HMAC SA Key.](#create-hmac-sa-key.)
  * [Deactivate HMAC SA Key.](#deactivate-hmac-sa-key.)
  * [Delete HMAC SA Key.](#delete-hmac-sa-key.)
  * [Get HMAC SA Key Metadata.](#get-hmac-sa-key-metadata.)
  * [List HMAC SA Keys Metadata.](#list-hmac-sa-keys-metadata.)
  * [List Buckets](#list-buckets)
  * [List Buckets Partial Success](#list-buckets-partial-success)
  * [List Files](#list-files)
  * [List Files By Prefix](#list-files-by-prefix)
  * [List Files Paginate](#list-files-paginate)
  * [List Files with Old Versions.](#list-files-with-old-versions.)
  * [List Notifications](#list-notifications)
  * [List Soft Deleted Bucket](#list-soft-deleted-bucket)
  * [List Soft Deleted Object Versions](#list-soft-deleted-object-versions)
  * [List Soft Deleted Objects](#list-soft-deleted-objects)
  * [Lock Retention Policy](#lock-retention-policy)
  * [Storage Make Bucket Public.](#storage-make-bucket-public.)
  * [Make Public](#make-public)
  * [Move File](#move-file)
  * [Move File Atomic](#move-file-atomic)
  * [Print Bucket Acl](#print-bucket-acl)
  * [Print Bucket Acl For User](#print-bucket-acl-for-user)
  * [Print File Acl](#print-file-acl)
  * [Print File Acl For User](#print-file-acl-for-user)
  * [Quickstart](#quickstart)
  * [Release Event Based Hold](#release-event-based-hold)
  * [Release Temporary Hold](#release-temporary-hold)
  * [Remove Bucket Conditional Binding](#remove-bucket-conditional-binding)
  * [Storage Remove Bucket Cors Configuration.](#storage-remove-bucket-cors-configuration.)
  * [Remove Bucket Default Owner](#remove-bucket-default-owner)
  * [Remove Bucket Iam Member](#remove-bucket-iam-member)
  * [Storage Remove Bucket Label.](#storage-remove-bucket-label.)
  * [Remove Bucket Owner Acl](#remove-bucket-owner-acl)
  * [Remove Default KMS Key.](#remove-default-kms-key.)
  * [Remove File Owner Acl](#remove-file-owner-acl)
  * [Remove Retention Policy](#remove-retention-policy)
  * [Rename File](#rename-file)
  * [Restore Soft Deleted Bucket](#restore-soft-deleted-bucket)
  * [Restore Soft Deleted Object](#restore-soft-deleted-object)
  * [Rotate Encryption Key](#rotate-encryption-key)
  * [Set Autoclass](#set-autoclass)
  * [Set Client Endpoint](#set-client-endpoint)
  * [Set Event Based Hold](#set-event-based-hold)
  * [Set the object retention policy of a File.](#set-the-object-retention-policy-of-a-file.)
  * [Set Public Access Prevention Enforced](#set-public-access-prevention-enforced)
  * [Set Public Access Prevention Inherited](#set-public-access-prevention-inherited)
  * [Set RPO Async Turbo](#set-rpo-async-turbo)
  * [Set RPO Default](#set-rpo-default)
  * [Set Retention Policy](#set-retention-policy)
  * [Set Soft Delete Policy](#set-soft-delete-policy)
  * [Set Temporary Hold](#set-temporary-hold)
  * [Stream File Download](#stream-file-download)
  * [Stream File Upload](#stream-file-upload)
  * [Upload a directory to a bucket.](#upload-a-directory-to-a-bucket.)
  * [Upload Directory With Transfer Manager](#upload-directory-with-transfer-manager)
  * [Upload Encrypted File](#upload-encrypted-file)
  * [Upload File](#upload-file)
  * [Upload a File in Chunks With Transfer Manager](#upload-a-file-in-chunks-with-transfer-manager)
  * [Upload File With Kms Key](#upload-file-with-kms-key)
  * [Upload From Memory](#upload-from-memory)
  * [Upload Many Files With Transfer Manager](#upload-many-files-with-transfer-manager)
  * [Upload Without Authentication](#upload-without-authentication)
  * [Upload Without Authentication Signed Url](#upload-without-authentication-signed-url)
  * [View Bucket Iam Members](#view-bucket-iam-members)

## Before you begin

Before running the samples, make sure you've followed the steps outlined in
[Using the client library](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/storage#using-the-client-library).

`cd storage`

`npm install`

`cd ..`

## Samples



### Add Bucket Conditional Binding

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/addBucketConditionalBinding.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/addBucketConditionalBinding.js,storage/README.md)

__Usage:__


`node addBucketConditionalBinding.js`


-----




### Add Bucket Default Owner Acl

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/addBucketDefaultOwnerAcl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/addBucketDefaultOwnerAcl.js,storage/README.md)

__Usage:__


`node addBucketDefaultOwnerAcl.js`


-----




### Add Bucket Iam Member

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/addBucketIamMember.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/addBucketIamMember.js,storage/README.md)

__Usage:__


`node addBucketIamMember.js`


-----




### Storage Add Bucket Label.

Adds bucket label.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/addBucketLabel.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/addBucketLabel.js,storage/README.md)

__Usage:__


`node addBucketLabel.js <BUCKET_NAME> <LABEL_KEY> <LABEL_VALUE>`


-----




### Add Bucket Owner Acl

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/addBucketOwnerAcl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/addBucketOwnerAcl.js,storage/README.md)

__Usage:__


`node addBucketOwnerAcl.js`


-----




### Bucket Website Configuration.

Bucket Website Configuration.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/addBucketWebsiteConfiguration.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/addBucketWebsiteConfiguration.js,storage/README.md)

__Usage:__


`node addBucketWebsiteConfiguration.js <BUCKET_NAME> <MAIN_PAGE_SUFFIX> <NOT_FOUND_PAGE>`


-----




### Add File Owner Acl

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/addFileOwnerAcl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/addFileOwnerAcl.js,storage/README.md)

__Usage:__


`node addFileOwnerAcl.js`


-----




### Storage Get Bucket Metadata.

Get bucket metadata.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/bucketMetadata.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/bucketMetadata.js,storage/README.md)

__Usage:__


`node bucketMetadata.js <BUCKET_NAME>`


-----




### Change Bucket's Default Storage Class.

Change Bucket's Default Storage Class.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/changeDefaultStorageClass.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/changeDefaultStorageClass.js,storage/README.md)

__Usage:__


`node changeDefaultStorageClass.js <BUCKET_NAME> <CLASS_NAME>`


-----




### Storage File Convert CSEK to CMEK.

Storage File Convert CSEK to CMEK.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/changeFileCSEKToCMEK.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/changeFileCSEKToCMEK.js,storage/README.md)

__Usage:__


`node changeFileCSEKToCMEK.js <BUCKET_NAME> <FILE_NAME> <ENCRYPTION_KEY> <KMS_KEY_NAME>`


-----




### Storage Combine files.

Combine multiple files into one new file.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/composeFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/composeFile.js,storage/README.md)

__Usage:__


`node composeFile.js <BUCKET_NAME> <FIRST_FILE_NAME> <SECOND_FILE_NAME> <DESTINATION_FILE_NAME>`


-----




### Storage Configure Bucket Cors.

Configures bucket cors.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/configureBucketCors.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/configureBucketCors.js,storage/README.md)

__Usage:__


`node configureBucketCors.js <BUCKET_NAME> <MAX_AGE_SECONDS> <METHOD> <ORIGIN> <RESPONSE_HEADER>`


-----




### Configure Retries

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/configureRetries.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/configureRetries.js,storage/README.md)

__Usage:__


`node configureRetries.js`


-----




### Copy File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/copyFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/copyFile.js,storage/README.md)

__Usage:__


`node copyFile.js`


-----




### Copy Old Version Of File.

Copy Old Version Of File.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/copyOldVersionOfFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/copyOldVersionOfFile.js,storage/README.md)

__Usage:__


`node copyOldVersionOfFile.js <SRC_BUCKET_NAME> <SRC_FILE_NAME> <DEST_BUCKET_NAME> <DEST_FILE_NAME> <GENERATION>`


-----




### Create a Dual-Region Bucket

Create a Dual-Region Bucket with provided location and regions.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/createBucketWithDualRegion.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/createBucketWithDualRegion.js,storage/README.md)

__Usage:__


`node createBucketWithDualRegion.js <BUCKET_NAME> <LOCATION> <REGION1> <REGION2>`


-----




### Create a hierarchical namespace enabled bucket

Create a hierarchical namespace enabled bucket.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/createBucketWithHierarchicalNamespace.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/createBucketWithHierarchicalNamespace.js,storage/README.md)

__Usage:__


`node createBucketWithHierarchicalNamespace.js <BUCKET_NAME>`


-----




### Create a Bucket with object retention enabled.

Create a Bucket with object retention enabled.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/createBucketWithObjectRetention.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/createBucketWithObjectRetention.js,storage/README.md)

__Usage:__


`node createBucketWithObjectRetention.js <BUCKET_NAME>`


-----




### Create Bucket With Storage Class and Location.

Create Bucket With Storage Class and Location.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/createBucketWithStorageClassAndLocation.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/createBucketWithStorageClassAndLocation.js,storage/README.md)

__Usage:__


`node createBucketWithStorageClassAndLocation.js <BUCKET_NAME> <CLASS_NAME> <LOCATION>`


-----




### Create Bucket With Turbo Replication

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/createBucketWithTurboReplication.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/createBucketWithTurboReplication.js,storage/README.md)

__Usage:__


`node createBucketWithTurboReplication.js`


-----




### Create New Bucket

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/createNewBucket.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/createNewBucket.js,storage/README.md)

__Usage:__


`node createNewBucket.js`


-----




### Create Notification

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/createNotification.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/createNotification.js,storage/README.md)

__Usage:__


`node createNotification.js`


-----




### Delete Bucket

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/deleteBucket.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/deleteBucket.js,storage/README.md)

__Usage:__


`node deleteBucket.js`


-----




### Delete File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/deleteFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/deleteFile.js,storage/README.md)

__Usage:__


`node deleteFile.js`


-----




### Delete Notification

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/deleteNotification.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/deleteNotification.js,storage/README.md)

__Usage:__


`node deleteNotification.js`


-----




### Delete Old Version Of File.

Delete Old Version Of File.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/deleteOldVersionOfFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/deleteOldVersionOfFile.js,storage/README.md)

__Usage:__


`node deleteOldVersionOfFile.js <BUCKET_NAME> <FILE_NAME> <GENERATION>`


-----




### Disable Bucket Lifecycle Management

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/disableBucketLifecycleManagement.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/disableBucketLifecycleManagement.js,storage/README.md)

__Usage:__


`node disableBucketLifecycleManagement.js`


-----




### Storage Disable Bucket Versioning.

Disables bucket versioning.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/disableBucketVersioning.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/disableBucketVersioning.js,storage/README.md)

__Usage:__


`node disableBucketVersioning.js <BUCKET_NAME>`


-----




### Disable Default Event Based Hold

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/disableDefaultEventBasedHold.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/disableDefaultEventBasedHold.js,storage/README.md)

__Usage:__


`node disableDefaultEventBasedHold.js`


-----




### Disable Requester Pays

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/disableRequesterPays.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/disableRequesterPays.js,storage/README.md)

__Usage:__


`node disableRequesterPays.js`


-----




### Disable Soft Delete

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/disableSoftDelete.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/disableSoftDelete.js,storage/README.md)

__Usage:__


`node disableSoftDelete.js`


-----




### Disable Uniform Bucket Level Access

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/disableUniformBucketLevelAccess.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/disableUniformBucketLevelAccess.js,storage/README.md)

__Usage:__


`node disableUniformBucketLevelAccess.js`


-----




### Download Byte Range

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadByteRange.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadByteRange.js,storage/README.md)

__Usage:__


`node downloadByteRange.js`


-----




### Download Encrypted File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadEncryptedFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadEncryptedFile.js,storage/README.md)

__Usage:__


`node downloadEncryptedFile.js`


-----




### Download File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadFile.js,storage/README.md)

__Usage:__


`node downloadFile.js`


-----




### Download a File in Chunks With Transfer Manager

Downloads a single file in in chunks in parallel utilizing transfer manager.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadFileInChunksWithTransferManager.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadFileInChunksWithTransferManager.js,storage/README.md)

__Usage:__


`node downloadFileInChunksWithTransferManager.js <BUCKET_NAME> <FILE_NAME> <DESTINATION_FILE_NAME> <CHUNK_SIZE>`


-----




### Download File Using Requester Pays

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadFileUsingRequesterPays.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadFileUsingRequesterPays.js,storage/README.md)

__Usage:__


`node downloadFileUsingRequesterPays.js`


-----




### Download Folder With Transfer Manager

Downloads a folder in parallel utilizing transfer manager.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadFolderWithTransferManager.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadFolderWithTransferManager.js,storage/README.md)

__Usage:__


`node downloadFolderWithTransferManager.js <BUCKET_NAME> <FOLDER_NAME>`


-----




### Download Into Memory

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadIntoMemory.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadIntoMemory.js,storage/README.md)

__Usage:__


`node downloadIntoMemory.js`


-----




### Download Many Files With Transfer Manager

Downloads many files in parallel utilizing transfer manager.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadManyFilesWithTransferManager.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadManyFilesWithTransferManager.js,storage/README.md)

__Usage:__


`node downloadManyFilesWithTransferManager.js <BUCKET_NAME> <FIRST_FILE_NAME> <SECOND_FILE_NAME>`


-----




### Storage Download Public File.

Download Public File.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/downloadPublicFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/downloadPublicFile.js,storage/README.md)

__Usage:__


`node downloadPublicFile.js <BUCKET_NAME> <SRC_FILE_NAME> <DEST_FILE_NAME>`


-----




### Enable Bucket Lifecycle Management

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/enableBucketLifecycleManagement.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/enableBucketLifecycleManagement.js,storage/README.md)

__Usage:__


`node enableBucketLifecycleManagement.js`


-----




### Storage Enable Bucket Versioning.

Enables bucket versioning.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/enableBucketVersioning.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/enableBucketVersioning.js,storage/README.md)

__Usage:__


`node enableBucketVersioning.js <BUCKET_NAME>`


-----




### Enable Default Event Based Hold

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/enableDefaultEventBasedHold.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/enableDefaultEventBasedHold.js,storage/README.md)

__Usage:__


`node enableDefaultEventBasedHold.js`


-----




### Enable Default KMS Key

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/enableDefaultKMSKey.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/enableDefaultKMSKey.js,storage/README.md)

__Usage:__


`node enableDefaultKMSKey.js`


-----




### Enable Requester Pays

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/enableRequesterPays.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/enableRequesterPays.js,storage/README.md)

__Usage:__


`node enableRequesterPays.js`


-----




### Enable Uniform Bucket Level Access

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/enableUniformBucketLevelAccess.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/enableUniformBucketLevelAccess.js,storage/README.md)

__Usage:__


`node enableUniformBucketLevelAccess.js`


-----




### Change File's Storage Class.

Change File's Storage Class.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/fileChangeStorageClass.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/fileChangeStorageClass.js,storage/README.md)

__Usage:__


`node fileChangeStorageClass.js <BUCKET_NAME> <FILE_NAME> <CLASS_NAME>`


-----




### Storage Set File Metadata.

Set file metadata.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/fileSetMetadata.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/fileSetMetadata.js,storage/README.md)

__Usage:__


`node fileSetMetadata.js <BUCKET_NAME> <FILE_NAME>`


-----




### Generate Encryption Key

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/generateEncryptionKey.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/generateEncryptionKey.js,storage/README.md)

__Usage:__


`node generateEncryptionKey.js`


-----




### Generate Signed Url

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/generateSignedUrl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/generateSignedUrl.js,storage/README.md)

__Usage:__


`node generateSignedUrl.js`


-----




### Generate V4 Read Signed Url

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/generateV4ReadSignedUrl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/generateV4ReadSignedUrl.js,storage/README.md)

__Usage:__


`node generateV4ReadSignedUrl.js`


-----




### Generate V4 Signed Policy

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/generateV4SignedPolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/generateV4SignedPolicy.js,storage/README.md)

__Usage:__


`node generateV4SignedPolicy.js`


-----




### Generate V4 Upload Signed Url

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/generateV4UploadSignedUrl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/generateV4UploadSignedUrl.js,storage/README.md)

__Usage:__


`node generateV4UploadSignedUrl.js`


-----




### Get Autoclass

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getAutoclass.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getAutoclass.js,storage/README.md)

__Usage:__


`node getAutoclass.js`


-----




### Get Default Event Based Hold

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getDefaultEventBasedHold.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getDefaultEventBasedHold.js,storage/README.md)

__Usage:__


`node getDefaultEventBasedHold.js`


-----




### Get Metadata

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getMetadata.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getMetadata.js,storage/README.md)

__Usage:__


`node getMetadata.js`


-----




### Get Metadata Notifications

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getMetadataNotifications.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getMetadataNotifications.js,storage/README.md)

__Usage:__


`node getMetadataNotifications.js`


-----




### Get Public Access Prevention

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getPublicAccessPrevention.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getPublicAccessPrevention.js,storage/README.md)

__Usage:__


`node getPublicAccessPrevention.js`


-----




### Get RPO

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getRPO.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getRPO.js,storage/README.md)

__Usage:__


`node getRPO.js`


-----




### Get Requester Pays Status

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getRequesterPaysStatus.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getRequesterPaysStatus.js,storage/README.md)

__Usage:__


`node getRequesterPaysStatus.js`


-----




### Get Retention Policy

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getRetentionPolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getRetentionPolicy.js,storage/README.md)

__Usage:__


`node getRetentionPolicy.js`


-----




### Storage Get Service Account.

Get Service Account.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getServiceAccount.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getServiceAccount.js,storage/README.md)

__Usage:__


`node getServiceAccount.js <PROJECT_ID>`


-----




### Get Soft Delete Policy

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getSoftDeletePolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getSoftDeletePolicy.js,storage/README.md)

__Usage:__


`node getSoftDeletePolicy.js`


-----




### Get Soft Deleted Bucket

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getSoftDeletedBucket.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getSoftDeletedBucket.js,storage/README.md)

__Usage:__


`node getSoftDeletedBucket.js`


-----




### Get Uniform Bucket Level Access

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/getUniformBucketLevelAccess.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/getUniformBucketLevelAccess.js,storage/README.md)

__Usage:__


`node getUniformBucketLevelAccess.js`


-----




### Activate HMAC SA Key.

Activate HMAC SA Key.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/hmacKeyActivate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/hmacKeyActivate.js,storage/README.md)

__Usage:__


`node hmacKeyActivate.js <hmacKeyAccessId> [projectId]`


-----




### Create HMAC SA Key.

Create HMAC SA Key.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/hmacKeyCreate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/hmacKeyCreate.js,storage/README.md)

__Usage:__


`node hmacKeyCreate.js <serviceAccountEmail> [projectId]`


-----




### Deactivate HMAC SA Key.

Deactivate HMAC SA Key.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/hmacKeyDeactivate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/hmacKeyDeactivate.js,storage/README.md)

__Usage:__


`node hmacKeyDeactivate.js <hmacKeyAccessId> [projectId]`


-----




### Delete HMAC SA Key.

Delete HMAC SA Key.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/hmacKeyDelete.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/hmacKeyDelete.js,storage/README.md)

__Usage:__


`node hmacKeyDelete.js <hmacKeyAccessId> [projectId]`


-----




### Get HMAC SA Key Metadata.

Get HMAC SA Key Metadata.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/hmacKeyGet.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/hmacKeyGet.js,storage/README.md)

__Usage:__


`node hmacKeyGet.js <hmacKeyAccessId> [projectId]`


-----




### List HMAC SA Keys Metadata.

List HMAC SA Keys Metadata.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/hmacKeysList.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/hmacKeysList.js,storage/README.md)

__Usage:__


`node hmacKeysList.js [projectId]`


-----




### List Buckets

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listBuckets.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listBuckets.js,storage/README.md)

__Usage:__


`node listBuckets.js`


-----




### List Buckets Partial Success

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listBucketsPartialSuccess.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listBucketsPartialSuccess.js,storage/README.md)

__Usage:__


`node listBucketsPartialSuccess.js`


-----




### List Files

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listFiles.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listFiles.js,storage/README.md)

__Usage:__


`node listFiles.js`


-----




### List Files By Prefix

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listFilesByPrefix.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listFilesByPrefix.js,storage/README.md)

__Usage:__


`node listFilesByPrefix.js`


-----




### List Files Paginate

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listFilesPaginate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listFilesPaginate.js,storage/README.md)

__Usage:__


`node listFilesPaginate.js`


-----




### List Files with Old Versions.

List Files with Old Versions.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listFilesWithOldVersions.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listFilesWithOldVersions.js,storage/README.md)

__Usage:__


`node listFilesWithOldVersions.js <BUCKET_NAME>`


-----




### List Notifications

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listNotifications.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listNotifications.js,storage/README.md)

__Usage:__


`node listNotifications.js`


-----




### List Soft Deleted Bucket

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listSoftDeletedBucket.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listSoftDeletedBucket.js,storage/README.md)

__Usage:__


`node listSoftDeletedBucket.js`


-----




### List Soft Deleted Object Versions

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listSoftDeletedObjectVersions.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listSoftDeletedObjectVersions.js,storage/README.md)

__Usage:__


`node listSoftDeletedObjectVersions.js`


-----




### List Soft Deleted Objects

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/listSoftDeletedObjects.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/listSoftDeletedObjects.js,storage/README.md)

__Usage:__


`node listSoftDeletedObjects.js`


-----




### Lock Retention Policy

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/lockRetentionPolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/lockRetentionPolicy.js,storage/README.md)

__Usage:__


`node lockRetentionPolicy.js`


-----




### Storage Make Bucket Public.

Storage Make Bucket Public.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/makeBucketPublic.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/makeBucketPublic.js,storage/README.md)

__Usage:__


`node makeBucketPublic.js <BUCKET_NAME>`


-----




### Make Public

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/makePublic.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/makePublic.js,storage/README.md)

__Usage:__


`node makePublic.js`


-----




### Move File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/moveFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/moveFile.js,storage/README.md)

__Usage:__


`node moveFile.js`


-----




### Move File Atomic

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/moveFileAtomic.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/moveFileAtomic.js,storage/README.md)

__Usage:__


`node moveFileAtomic.js`


-----




### Print Bucket Acl

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/printBucketAcl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/printBucketAcl.js,storage/README.md)

__Usage:__


`node printBucketAcl.js`


-----




### Print Bucket Acl For User

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/printBucketAclForUser.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/printBucketAclForUser.js,storage/README.md)

__Usage:__


`node printBucketAclForUser.js`


-----




### Print File Acl

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/printFileAcl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/printFileAcl.js,storage/README.md)

__Usage:__


`node printFileAcl.js`


-----




### Print File Acl For User

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/printFileAclForUser.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/printFileAclForUser.js,storage/README.md)

__Usage:__


`node printFileAclForUser.js`


-----




### Quickstart

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/quickstart.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/quickstart.js,storage/README.md)

__Usage:__


`node quickstart.js`


-----




### Release Event Based Hold

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/releaseEventBasedHold.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/releaseEventBasedHold.js,storage/README.md)

__Usage:__


`node releaseEventBasedHold.js`


-----




### Release Temporary Hold

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/releaseTemporaryHold.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/releaseTemporaryHold.js,storage/README.md)

__Usage:__


`node releaseTemporaryHold.js`


-----




### Remove Bucket Conditional Binding

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeBucketConditionalBinding.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeBucketConditionalBinding.js,storage/README.md)

__Usage:__


`node removeBucketConditionalBinding.js`


-----




### Storage Remove Bucket Cors Configuration.

Removes bucket cors configuration.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeBucketCors.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeBucketCors.js,storage/README.md)

__Usage:__


`node removeBucketCors.js <BUCKET_NAME>`


-----




### Remove Bucket Default Owner

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeBucketDefaultOwner.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeBucketDefaultOwner.js,storage/README.md)

__Usage:__


`node removeBucketDefaultOwner.js`


-----




### Remove Bucket Iam Member

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeBucketIamMember.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeBucketIamMember.js,storage/README.md)

__Usage:__


`node removeBucketIamMember.js`


-----




### Storage Remove Bucket Label.

Removes bucket label.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeBucketLabel.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeBucketLabel.js,storage/README.md)

__Usage:__


`node removeBucketLabel.js <BUCKET_NAME> <LABEL_KEY>)`


-----




### Remove Bucket Owner Acl

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeBucketOwnerAcl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeBucketOwnerAcl.js,storage/README.md)

__Usage:__


`node removeBucketOwnerAcl.js`


-----




### Remove Default KMS Key.

Remove Default KMS Key.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeDefaultKMSKey.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeDefaultKMSKey.js,storage/README.md)

__Usage:__


`node removeDefaultKMSKey.js <BUCKET_NAME>`


-----




### Remove File Owner Acl

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeFileOwnerAcl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeFileOwnerAcl.js,storage/README.md)

__Usage:__


`node removeFileOwnerAcl.js`


-----




### Remove Retention Policy

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/removeRetentionPolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/removeRetentionPolicy.js,storage/README.md)

__Usage:__


`node removeRetentionPolicy.js`


-----




### Rename File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/renameFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/renameFile.js,storage/README.md)

__Usage:__


`node renameFile.js`


-----




### Restore Soft Deleted Bucket

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/restoreSoftDeletedBucket.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/restoreSoftDeletedBucket.js,storage/README.md)

__Usage:__


`node restoreSoftDeletedBucket.js`


-----




### Restore Soft Deleted Object

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/restoreSoftDeletedObject.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/restoreSoftDeletedObject.js,storage/README.md)

__Usage:__


`node restoreSoftDeletedObject.js`


-----




### Rotate Encryption Key

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/rotateEncryptionKey.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/rotateEncryptionKey.js,storage/README.md)

__Usage:__


`node rotateEncryptionKey.js`


-----




### Set Autoclass

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setAutoclass.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setAutoclass.js,storage/README.md)

__Usage:__


`node setAutoclass.js`


-----




### Set Client Endpoint

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setClientEndpoint.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setClientEndpoint.js,storage/README.md)

__Usage:__


`node setClientEndpoint.js`


-----




### Set Event Based Hold

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setEventBasedHold.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setEventBasedHold.js,storage/README.md)

__Usage:__


`node setEventBasedHold.js`


-----




### Set the object retention policy of a File.

Set the object retention policy of a File.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setObjectRetentionPolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setObjectRetentionPolicy.js,storage/README.md)

__Usage:__


`node setObjectRetentionPolicy.js <BUCKET_NAME>`


-----




### Set Public Access Prevention Enforced

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setPublicAccessPreventionEnforced.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setPublicAccessPreventionEnforced.js,storage/README.md)

__Usage:__


`node setPublicAccessPreventionEnforced.js`


-----




### Set Public Access Prevention Inherited

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setPublicAccessPreventionInherited.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setPublicAccessPreventionInherited.js,storage/README.md)

__Usage:__


`node setPublicAccessPreventionInherited.js`


-----




### Set RPO Async Turbo

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setRPOAsyncTurbo.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setRPOAsyncTurbo.js,storage/README.md)

__Usage:__


`node setRPOAsyncTurbo.js`


-----




### Set RPO Default

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setRPODefault.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setRPODefault.js,storage/README.md)

__Usage:__


`node setRPODefault.js`


-----




### Set Retention Policy

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setRetentionPolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setRetentionPolicy.js,storage/README.md)

__Usage:__


`node setRetentionPolicy.js`


-----




### Set Soft Delete Policy

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setSoftDeletePolicy.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setSoftDeletePolicy.js,storage/README.md)

__Usage:__


`node setSoftDeletePolicy.js`


-----




### Set Temporary Hold

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/setTemporaryHold.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/setTemporaryHold.js,storage/README.md)

__Usage:__


`node setTemporaryHold.js`


-----




### Stream File Download

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/streamFileDownload.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/streamFileDownload.js,storage/README.md)

__Usage:__


`node streamFileDownload.js`


-----




### Stream File Upload

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/streamFileUpload.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/streamFileUpload.js,storage/README.md)

__Usage:__


`node streamFileUpload.js`


-----




### Upload a directory to a bucket.

Uploads full hierarchy of a local directory to a bucket.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadDirectory.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadDirectory.js,storage/README.md)

__Usage:__


`node uploadDirectory.js <bucketName> <directoryPath>`


-----




### Upload Directory With Transfer Manager

Uploads a directory in parallel utilizing transfer manager.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadDirectoryWithTransferManager.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadDirectoryWithTransferManager.js,storage/README.md)

__Usage:__


`node uploadDirectoryWithTransferManager.js <BUCKET_NAME> <DIRECTORY_NAME>`


-----




### Upload Encrypted File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadEncryptedFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadEncryptedFile.js,storage/README.md)

__Usage:__


`node uploadEncryptedFile.js`


-----




### Upload File

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadFile.js,storage/README.md)

__Usage:__


`node uploadFile.js`


-----




### Upload a File in Chunks With Transfer Manager

Uploads a single file in in chunks in parallel utilizing transfer manager.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadFileInChunksWithTransferManager.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadFileInChunksWithTransferManager.js,storage/README.md)

__Usage:__


`node uploadFileInChunksWithTransferManager.js <BUCKET_NAME> <FILE_NAME> <CHUNK_SIZE>`


-----




### Upload File With Kms Key

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadFileWithKmsKey.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadFileWithKmsKey.js,storage/README.md)

__Usage:__


`node uploadFileWithKmsKey.js`


-----




### Upload From Memory

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadFromMemory.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadFromMemory.js,storage/README.md)

__Usage:__


`node uploadFromMemory.js`


-----




### Upload Many Files With Transfer Manager

Uploads many files in parallel utilizing transfer manager.

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadManyFilesWithTransferManager.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadManyFilesWithTransferManager.js,storage/README.md)

__Usage:__


`node uploadManyFilesWithTransferManager.js <BUCKET_NAME> <FIRST_FILE_NAME> <SECOND_FILE_NAME>`


-----




### Upload Without Authentication

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadWithoutAuthentication.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadWithoutAuthentication.js,storage/README.md)

__Usage:__


`node uploadWithoutAuthentication.js`


-----




### Upload Without Authentication Signed Url

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/uploadWithoutAuthenticationSignedUrl.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/uploadWithoutAuthenticationSignedUrl.js,storage/README.md)

__Usage:__


`node uploadWithoutAuthenticationSignedUrl.js`


-----




### View Bucket Iam Members

View the [source code](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/storage/viewBucketIamMembers.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/viewBucketIamMembers.js,storage/README.md)

__Usage:__


`node viewBucketIamMembers.js`






[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=storage/README.md
[product-docs]: https://cloud.google.com/storage