## Hapi on Google App Engine

> [Hapi](http://hapijs.com/) is a rich framework for building applications and services. Hapi enabled developers to focus on writing reusable application logic instead of spending time building infrastructure.

##### Create a new Hapi app

[View the Hapi docs](http://hapijs.com/).

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

Update `package.json` to add an `npm start` command:

```json
"scripts": {
  "start": "node index.js",
}
```

Update the port in `index.js` to use `process.env.PORT || 8080`, and `0.0.0.0`:

```js
server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 8080
});
```

##### Deploy

For convenience, you can use an npm script to run the deploy command. Modify your `package.json` to include:

```json
"scripts": {
  "start": "node index.js",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.