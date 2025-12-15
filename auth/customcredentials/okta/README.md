# Running the Custom Okta Credential Supplier Sample (Node.js)

This sample demonstrates how to use a custom subject token supplier to authenticate with Google Cloud using Okta as an external identity provider. It uses the Client Credentials flow for machine-to-machine (M2M) authentication.

## Prerequisites

*   An Okta developer account.
*   A Google Cloud project with the IAM API enabled.
*   A Google Cloud Storage bucket. Ensure that the authenticated user has access to this bucket.
*   **Node.js 16** or later installed.
*   **npm** installed.

## Okta Configuration

Before running the sample, you need to configure an Okta application for Machine-to-Machine (M2M) communication.

### Create an M2M Application in Okta

1.  Log in to your Okta developer console.
2.  Navigate to **Applications** > **Applications** and click **Create App Integration**.
3.  Select **API Services** as the sign-on method and click **Next**.
4.  Give your application a name and click **Save**.

### Obtain Okta Credentials

Once the application is created, you will find the following information in the **General** tab:

*   **Okta Domain**: Your Okta developer domain (e.g., `https://dev-123456.okta.com`).
*   **Client ID**: The client ID for your application.
*   **Client Secret**: The client secret for your application.

You will need these values to configure the sample.

## Google Cloud Configuration

You need to configure a Workload Identity Pool in Google Cloud to trust the Okta application.

### Set up Workload Identity Federation

1.  In the Google Cloud Console, navigate to **IAM & Admin** > **Workload Identity Federation**.
2.  Click **Create Pool** to create a new Workload Identity Pool.
3.  Add a new **OIDC provider** to the pool.
4.  Configure the provider with your Okta domain as the issuer URL.
5.  Map the Okta `sub` (subject) assertion to a GCP principal.

For detailed instructions, refer to the [Workload Identity Federation documentation](https://cloud.google.com/iam/docs/workload-identity-federation).

## Running the Sample

To run the sample on your local system, you need to install dependencies and configure your credentials.

### 1. Install Dependencies

This command downloads all required Node.js libraries.

```bash
npm install
```

### 2. Configure Credentials

For local development, this sample reads configuration from a JSON file.

1.  Create a file named `custom-credentials-okta-secrets.json` in the project root.
2.  Add the following content, replacing the placeholder values with your configuration:

```json
{
  "gcp_workload_audience": "//iam.googleapis.com/projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL/providers/YOUR_PROVIDER",
  "gcs_bucket_name": "your-bucket-name",
  "okta_domain": "https://dev-123456.okta.com",
  "okta_client_id": "your-okta-client-id",
  "okta_client_secret": "your-okta-client-secret",
  "gcp_service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/your-sa@your-project.iam.gserviceaccount.com:generateAccessToken"
}
```

**Note:** Do not check your secrets file into version control.

### 3. Run the Application

Execute the script using Node.js:

```bash
node customCredentialSupplierOkta.js
```

The script authenticates with Okta to get an OIDC token, exchanges that token for a Google Cloud federated token, and uses it to list metadata for the specified Google Cloud Storage bucket.

## Testing

This sample is not continuously tested. It is provided for instructional purposes and may require modifications to work in your environment.
