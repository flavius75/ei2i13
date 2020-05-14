

var http = require('http');

var express = require('express');

var app = express();

app.get('/', function (request, response) {
    //The file will include the socket.io.js file to establish the socket connection
    response.sendFile(__dirname + '/index.html');
});

//Create a server that will serve both http and socket connection using the app function of Express.js
var server = http.createServer(app);

//4. Socket.io
//Pass the server to the socket.io to handle socket connection
var io = require('socket.io')(server);

var connectedCount =0;

//5. This function will be executed every time a user connect to the socket through the "/" express route

io.on("connection", function(socket){ 
    connectedCount += 1; 
    console.log("A new client connected!");
    socket.on("disconnect", function(){
      connectedCount -= 1;
      console.log("A client disconnected!");
    });
  });




//6. Listen to the "shared" server (not the Express.js app)
server.listen(3000, console.log("Listening to port 3000"));