## Mailgun on Google App Engine with Node.js

> [Mailgun](https://www.mailgun.com/): The Email Service For Developers
>
> – www.mailgun.com

This sample application demonstrates how to use
[Express.js](http://expressjs.com) and
[node-mailgun](http://github.com/shz/node-mailgun) to send transactional email
on [Google App Engine](https://cloud.google.com/appengine).

### Sign up for Mailgun

1. Sign up for a [Mailgun account](https://mailgun.com/signup).
1. Add a [new domain](https://mailgun.com/app/domains).
1. Find your API key in your new domain's settings.

### Configure

Add these lines to the `app.yaml` file in the root of your application:

```yaml
env_variables:
  PORT: 8080
  MAILGUN_API_KEY: <your-mailgun-api-key>
```

### Start the app locally

```
$ export MAILGUN_API_KEY=<your-mailgun-api-key>
$ npm start
```

Now visit http://localhost:8080 and try sending yourself an email.

When the app is deployed to Google Cloud Platform the `MAILGUN_API_KEY`
environment variable will be set to the value specified in `app.yaml`.

### Deploy

Ensure your gcloud sdk is setup by running:

```
$ gcloud init
```

For convenience, you can use an npm script to run the `gcloud` command. Add
these lines to your `package.json` file:

```json
"scripts": {
  "start": "node app.js",
  "deploy": "gcloud preview app deploy app.yaml --promote"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```