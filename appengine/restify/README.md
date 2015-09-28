# Restify -> Google App Engine

This is a simple guide to running [restify](http://restify.com/) on Google App Engine.  

1. Create a new directory for your code.

2. Run `npm init` and follow the prompts.

3. Create a `server.js` with the following code:

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

4. Run `npm install --save restify`

5. Create an `app.yaml` in the root of your application with the following contents:

	```yaml
	runtime: nodejs
	vm: true
	api_version: 1
	env_variables:
  	  PORT: 8080
	```

6. Deploy! For convenience, you can modify your `package.json` to use an npm script for deployment:

	```js
	"scripts": {
		...
	    "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
	  }
	```

	At the terminal you can now run `npm run deploy` to deploy your application. 
