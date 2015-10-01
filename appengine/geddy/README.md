## Geddy on Google App Engine

> [Geddy](http://geddyjs.org/) is a simple, structured web framework for Node.

##### Create a new Geddy app

[View the Geddy tutorial](http://geddyjs.org/tutorial).

##### Configure

Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

##### Prepare the app

Create a `server.js` that contains the following code:

```js
var geddy = require('geddy');

geddy.start({
  port: process.env.PORT || 8080
});
```

Run `npm install --save geddy`

##### Deploy

For convenience, you can use an npm script to run the deploy command. Modify your `package.json` to include:

```json
"scripts": {
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.