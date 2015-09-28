# Express -> Google App Engine

This is a simple guide to running [expressjs](http://expressjs.com/) on Google App Engine.

1. [Create a new Express app](http://expressjs.com/starter/generator.html)

2. Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
env_variables:
  PORT: 8080
```

3. Deploy your app. For convenience, you can use an npm script to run the command. Modify your `package.json` to include:

```js
"scripts": {
  "start": "node ./bin/www",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.
