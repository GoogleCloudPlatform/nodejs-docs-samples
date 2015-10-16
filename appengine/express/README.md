## Express on Google App Engine

> [Express](http://expressjs.com) is a minimal and flexible Node.js web
application framework that provides a robust set of features for web and mobile
applications.

You can view the deployed demo app [here](https://express-demo.appspot.com).

### Create a new Express app

View the [Express app generator guide](http://expressjs.com/starter/generator.html).

### Configure

Create an `app.yaml` in the root of your application with the following
contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

### Deploy

For convenience, you can use an npm script to run the `gcloud` command. Add
these lines to your `package.json` file:

```json
"scripts": {
  "start": "node ./bin/www",
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```