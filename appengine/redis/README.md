## Redis on Google App Engine

> [Redis](http://redis.io/) is an open source (BSD licensed), in-memory data structure store, used as database, cache and message broker.

##### Start a Redis server

There are multiple options to creating a new redis server:
- Create a GCE virtual machine with redis preinstalled
- Use [Redis Labs](https://redislabs.com/signup-gce-lp1) to create a free Redis-as-a-Service account

###### Sign up for a redis labs account

To sign up for a new redis labs account:

1. Create a new redis subscription
2. Choose the cloud `GCE/us-central1`
3. Choose the free tier
4. Click `select` 
5. Choose a resource name and password
6. Place your host name, port, and key into a json file.

Here's an example json file:

```json
{
  "redisHost": "pub-redis-*****.us-central1-1-1.gce.garantiadata.com",
  "redisPort": ******,
  "redisKey": "******"
}
```

Make sure to not check this file into source control by adding `keys.json` to your `.gitignore`. 

##### Configure

Create an `app.yaml` in the root of your application with the following contents:

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
  "start": "node ./bin/www",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.
