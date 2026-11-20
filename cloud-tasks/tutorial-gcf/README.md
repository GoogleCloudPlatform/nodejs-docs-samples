# [Node.js Cloud Tasks sample for Google App Engine and Cloud Functions][tutorial-link]

This is the sample application for the
[Using Cloud Tasks to trigger Cloud Functions][tutorial-link] tutorial.

This tutorial shows how to create [Cloud Tasks][cloud-tasks] on
[Google App Engine Standard][gae-std] to trigger a [Cloud Function][cloud-func]
in order to send a postcard email.

## Application Architecture

* The App Engine application calls the Cloud Tasks API to add a scheduled task
to the queue.

* The queue processes tasks and sends requests to a Cloud Function.

* The Cloud Function calls the SendGrid API to send a postcard email.

## Cloud Function Environment Variables

Configure the following environment variables when deploying `function/`:

* `SENDGRID_API_KEY`: Your SendGrid API key.
* `FUNCTION_URL`: The deployed Cloud Function HTTPS URL (used as the expected OIDC `audience`).
* `SERVICE_ACCOUNT_EMAIL`: The Cloud Tasks invoker service account email verified in the OIDC token.
* `ALLOWED_RECIPIENT_EMAILS`: Comma-separated list of permitted recipient email addresses. Requests fail with `403 Forbidden` if this variable is unset or the recipient is not allowlisted.

[tutorial-link]: https://cloud.google.com/tasks/docs/tutorial-gcf
[cloud-tasks]: https://cloud.google.com/tasks/docs/
[gae-std]: https://cloud.google.com/appengine/docs/standard/nodejs/
[cloud-func]: https://cloud.google.com/functions/
