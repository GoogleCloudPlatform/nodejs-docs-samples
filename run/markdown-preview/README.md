# Cloud Run Markdown Preview Sample

[Securing Cloud Run services tutorial](https://cloud.google.com/run/docs/tutorials/secure-services) walks through how to create a secure two-service application running on Cloud Run. This application is a Markdown editor which includes a public "frontend" service which anyone can use to compose Markdown text and a private "backend" service which renders Markdown text to HTML.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/run).

## Environment Variables

Cloud Run services can be [configured with Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables).
Required variables for this sample include:

* `EDITOR_UPSTREAM_RENDER_URL`: The URL of the restricted Cloud Run service that
  renders Markdown to HTML.

## Dependencies

* **express**: Web server framework.
* **google-auth-library**: OAuth2.0 library for authentication and authorization.
* **got**: Node.js library for HTTP requests.
* **handlebars** JavaScript template engine.
* **markdown-it**: JavaScript library for parsing and rendering Markdown text.
