

let cardsNames = ['Jad', 'Flavius', 'Victor', 'Joao', 'Yassine', 'Mama', 'Bolor', 'Wiliam', 'Piotr', 'Aymerick', 'Emmanuel', 'Khadija', 'Wiliam'];
let objects = ['apple', 'compas', 'drill', 'charger', 'netflix', 'cap', 'watch' ];
let ext = ".png"
class Card{
    constructor(name, photo, objects = []){
        this.name= name;
        this.photo=photo;
        this.objects=objects;
      }
  };
  
  let card1 = new Card(cardsNames[0], cardsNames[0].toLowerCase()+ext, [objects[1], objects[2]]);
  let card2 = new Card(cardsNames[1], cardsNames[1].toLowerCase()+ext, [objects[3], objects[6]]);
  let card3 = new Card(cardsNames[2], cardsNames[2].toLowerCase()+ext, [objects[2], objects[0]]);
  let card4 = new Card(cardsNames[3], cardsNames[3].toLowerCase()+ext, [objects[6], objects[5]]);
  let card5 = new Card(cardsNames[4], cardsNames[4].toLowerCase()+ext, [objects[5], objects[2]]);
  let card6 = new Card(cardsNames[5], cardsNames[5].toLowerCase()+ext, [objects[1], objects[2]]);
  let card7 = new Card(cardsNames[6], cardsNames[6].toLowerCase()+ext, [objects[1], objects[2]]);
  let card8 = new Card(cardsNames[7], cardsNames[7].toLowerCase()+ext, [objects[1], objects[2]]);
  let card9 = new Card(cardsNames[8], cardsNames[8].toLowerCase()+ext, [objects[1], objects[2]]);
  let card10 = new Card(cardsNames[9], cardsNames[9].toLowerCase()+ext, [objects[1], objects[2]]);
  let card11 = new Card(cardsNames[10], cardsNames[10].toLowerCase()+ext, [objects[1], objects[2]]);
  let card12 = new Card(cardsNames[11], cardsNames[11].toLowerCase()+ext, [objects[1], objects[2]]);
  let card13 = new Card(cardsNames[12], cardsNames[12].toLowerCase()+ext, [objects[1], objects[2]]);
  
  var deck = [card1, card2, card3, card4, card5, card6, card7, card8, card9, card10, card11, card12, card13];
  

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}


function distribute(collection, players){
  console.log("enter funct");
  let i=0;
  shuffle(collection);

  for(let player of players){
    player.emit('distribute', collection.slice(i, i+=3 ));
    console.log("cards sended");
  }

}


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


var clients = 0;
var sockets = [];


io.on('connection', function (socket) {
  console.log("A new client connected!");
  clients++;

  sockets.push(socket);

  if(clients === 2){
    console.log('let\'s play');
    
    distribute(deck, sockets);
 
  }

  socket.on('disconnect', function(){
    clients--;

    io.emit('playerCount', clients);
    console.log("Player Disconnected");
  })
});


    
     
    
    //6. Listen to the "shared" server (not the Express.js app)
    server.listen(3000, console.log("Listening to port 3000"));