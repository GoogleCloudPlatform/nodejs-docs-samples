## Restify on Google App Engine

> [Restify](http://mcavage.me/node-restify/) is a node.js module built specifically to enable you to build correct REST web services.

You can view the deployed demo app [here](https://restify-demo.appspot.com).

### Create a new  Restify app

Create a new directory for your code.

Run `npm init` and follow the prompts.

Create a `server.js` with the following code:

```js
var restify = require('restify');

var server = restify.createServer({
  name: 'appengine-restify',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.get('/', function (req, res, next) {
  res.send("restify on appengine")
});

server.listen(process.env.PORT || 8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
```

Run `npm install --save restify`

### Configure Create an `app.yaml` in the root of your application with the following contents:

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
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```