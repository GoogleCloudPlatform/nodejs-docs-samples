## Restify on Google App Engine

> [Restify](http://mcavage.me/node-restify/) is a node.js module built specifically to enable you to build correct REST web services.

##### Create a new  Restify app

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

##### Configure Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

##### Deploy

For convenience, you can use an npm script to run the deploy command. Modify your `package.json` to include:

```json
"scripts": {
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.