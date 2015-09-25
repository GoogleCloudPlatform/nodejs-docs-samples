var Hapi = require('hapi');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({ 
    host: '127.0.0.1', 
    port: process.env.PORT || 8080
});

// Add the route
server.route({
    method: 'GET',
    path:'/hello', 
    handler: function (request, reply) {
       reply('hello world');
    }
});

// Start the server
server.start();