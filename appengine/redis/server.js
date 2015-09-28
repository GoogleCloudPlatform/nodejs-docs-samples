var redis = require("redis");
var http = require("http");
var util = require("util");
var nconf = require("nconf");

// read in keys and secrets.  You can store these in a variety of ways.  
// I like to use a keys.json  file that is in the .gitignore file, 
// but you can also store them in environment variables
nconf.argv().env().file("keys.json");

// Connect to a redis server provisioned over at 
// redisLabs.  See the README for more info. 
var client = redis.createClient(
    nconf.get("redisPort") || "6379",
    nconf.get("redisHost") || "127.0.0.1", 
    {
        auth_pass: nconf.get("redisKey"), 
        return_buffers: true
    }
).on("error", function (err) {
    console.log("ERR:REDIS: " + err);
});    

// Create a simple little server. 
http.createServer(function (req, res) {
    
    client.on("error", function (err) {
        console.log("Error " + err);
    });

    // Track every IP that has visited this site
    var listName = "IPs";
    client.lpush(listName, req.connection.remoteAddress);
    client.ltrim(listName, 0, 25);

    // push out a range 
    var iplist = "";
    client.lrange(listName, 0, -1, function (err, data) {
        if (err) {
            console.log(err);
        }
        console.log("listing data...\n")
        data.forEach(function (ip, i) {

            console.log("IP: " + ip + "\n");
            iplist += ip + "; ";
        });
        
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(iplist);
    });

}).listen(process.env.PORT || 3000);

console.log("started web process");