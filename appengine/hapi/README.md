## Hapi on Google App Engine

> [Hapi](http://hapijs.com/) is a rich framework for building applications and services. Hapi enabled developers to focus on writing reusable application logic instead of spending time building infrastructure.

You can view the deployed demo app [here](https://hapi-demo.appspot.com).

### Create a new Hapi app

[View the Hapi docs](http://hapijs.com/).

### Configure

Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

### Prepare the app

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

### Deploy

For convenience, you can use an npm script to run the `gcloud` command. Add
these lines to your `package.json` file:

```json
"scripts": {
  "start": "node index.js",
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```