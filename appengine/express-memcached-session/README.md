# Express + Memcached Sessions -> Google App Engine

This is a simple guide to using memcached for session state while running [expressjs](http://expressjs.com/) on Google App Engine.  Each Google App Engine application comes with a memcached service instance, which can be reached with a standard memcached driver at `memcache:11211`.

1. [Create a new Express app](http://expressjs.com/starter/generator.html)

2. Create an `app.yaml` in the root of your application with the following contents:

    ```yaml
    runtime: nodejs
    vm: true
    env_variables:
      PORT: 8080
      MEMCACHE_URL: memcache:11211
    ```

    Notice the MEMCACHE_URL environment variable - this is where you can reach your standard memcached cluster across instances. 

3. Use the [connect-memcached](https://github.com/balor/connect-memcached) module.  Run `npm install --save connect-memcached`, and add the following to your server.js or app.js:

    ```js
    var MemcachedStore = require('connect-memcached')(session);
    ...
    app.use(session({
        secret: 'appengineFTW',
        key: 'test',
        proxy: 'true',
        store: new MemcachedStore({
            hosts: [process.env.MEMCACHE_URL || '127.0.0.1:11211']
        })
    }));
    ```
4. In your express route handlers, you can now safely use `req.session.*` across multiple nodejs instances:

    ```js
    app.get('/', function(req, res){
        publicIp.v4(function (err, ip) {
            res.write("<div>" + ip + "</div>");
            if(req.session.views) {
                ++req.session.views;
            } else {
                req.session.views = 1;
            }
            res.end('Viewed <strong>' + req.session.views + '</strong> times.');
        });
    });
    ```

5. To test the sample locally, you can install memcached.  
    - OSX + [Brew](http://brew.sh/): `brew install memcached`
    - Windows + [Chocolatey](https://chocolatey.org/packages/memcached): `choco install memcached`

    Run memcached on localhost:11211 by running `memcached`
    

6. Deploy your app. For convenience, you can use an npm script to run the command. Modify your `package.json` to include:

    ```js
    "scripts": {
      "start": "node server.js",
      "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
    }
    ```

At the terminal you can now run `npm run deploy` to deploy your application.
