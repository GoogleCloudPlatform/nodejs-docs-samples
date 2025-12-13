# Getting Started with Google Cloud Authentication

[![Open in Cloud Shell][shell_img]][shell_link]

[shell_img]: http://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&page=editor&open_in_editor=auth/README.md

## Access token from impersonated credentials

See the [documentation][auth-docs] for more information about authenticating for Google Cloud APIs.

[auth-docs]: https://cloud.google.com/docs/authentication/production

1. Install dependencies from `package.json`

        $ npm install

2. Set the environment variable `GOOGLE_CLOUD_PROJECT` to the project ID, set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the credential you're using. To run the sample, you need to provide the impersonated service account name and the scope.
See the sample for information on how to set up the service accounts in your
Google Cloud project.

3. To run the individual accessTokenFromImpersonatedCredentials.js test, you can do:

        $ npm run test:accessTokenFromImpersonatedCredentials

## Auth with Cloud Client

See the [documentation][auth-docs] for more information about authenticating for Google Cloud APIs.

[auth-docs]: https://cloud.google.com/docs/authentication/production

1. Install dependencies from `package.json`

        $ npm install

2. Set the environment variable `GOOGLE_CLOUD_PROJECT` to the project ID, set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the credential you're using,
and set the environment variable `BUCKET_NAME` to a bucket you created in the project.

3. To run the individual auth.js test, you can do:

        $ npm run test:auth

## Downscoping with Credential Access Boundaries

This section contains samples for
[Downscoping with Credential Access Boundaries](https://cloud.google.com/iam/docs/downscoping-short-lived-credentials).

### Running the samples

1. Your environment must be setup with [authentication
information](https://developers.google.com/identity/protocols/application-default-credentials#howtheywork). If you're running on Cloud Shell or Compute Engine, this is already setup. You can also use `gcloud auth application-default login`.

2. Install dependencies from `package.json`

        $ npm install

3. Set the environment variable `GOOGLE_CLOUD_PROJECT` to the project ID.

4. To run the individual downscoping.js test, you can do:

        $ npm run test:downscoping

## Custom Credential Suppliers

If you want to use external credentials (like AWS or Okta) that require custom retrieval logic not supported natively by the library, you can provide a custom supplier implementation.

### Custom AWS Credential Supplier

This sample demonstrates how to use the AWS SDK for Node.js as a custom `AwsSecurityCredentialsSupplier` to bridge AWS credentials—from sources like EKS IRSA, ECS, or local profiles—to Google Cloud Workload Identity.

#### 1. Set Environment Variables

```bash
# AWS Credentials (or use ~/.aws/credentials)
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="us-east-1"

# Google Cloud Config
# Format: //iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL_ID>/providers/<PROVIDER_ID>
export GCP_WORKLOAD_AUDIENCE="//iam.googleapis.com/projects/123456/locations/global/workloadIdentityPools/my-pool/providers/my-aws-provider"
export GCS_BUCKET_NAME="your-bucket-name"

# Optional: Service Account Impersonation
# export GCP_SERVICE_ACCOUNT_IMPERSONATION_URL="https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/my-sa@my-project.iam.gserviceaccount.com:generateAccessToken"
```

#### 2. Run the Sample

```bash
node custom-credential-supplier-aws.js
```

#### Running in Kubernetes (EKS)

To run this in an EKS cluster using IAM Roles for Service Accounts (IRSA):

1.  **Configure IRSA:** Associate an AWS IAM Role with your Kubernetes Service Account.
2.  **Configure GCP:** Allow the AWS IAM Role ARN to impersonate your Workload Identity Pool.
3.  **Deploy:** When deploying your Node.js application, ensure the Pod uses the annotated Service Account. The AWS SDK in the sample will automatically detect the credentials injected by the EKS OIDC webhook.

---

### Custom Okta Credential Supplier

This sample demonstrates how to use a custom `SubjectTokenSupplier` to fetch an OIDC token from **Okta** using the Client Credentials flow and exchange it for Google Cloud credentials via Workload Identity Federation.

#### 1. Okta Configuration

Ensure you have an Okta Machine-to-Machine (M2M) application set up with "Client Credentials" grant type enabled. You will need the Domain, Client ID, and Client Secret.

#### 2. Set Environment Variables

```bash
# Okta Configuration
export OKTA_DOMAIN="https://your-okta-domain.okta.com"
export OKTA_CLIENT_ID="your-okta-client-id"
export OKTA_CLIENT_SECRET="your-okta-client-secret"

# Google Cloud Config
export GCP_WORKLOAD_AUDIENCE="//iam.googleapis.com/projects/123456/locations/global/workloadIdentityPools/my-pool/providers/my-oidc-provider"
export GCS_BUCKET_NAME="your-bucket-name"

# Optional: Service Account Impersonation
# export GCP_SERVICE_ACCOUNT_IMPERSONATION_URL="https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/my-sa@my-project.iam.gserviceaccount.com:generateAccessToken"
```

#### 3. Run the Sample

```bash
node custom-credential-supplier-okta.js
```

### Additional resources

For more information on downscoped credentials you can visit:

> https://github.com/googleapis/google-auth-library-nodejs
