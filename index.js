// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));





// Cards 

let cardsNames = ['Jad', 'Flavius', 'Victor', 'Joao', 'Yassine', 'Mama', 'Bolor', 'Wiliam', 'Piotr', 'Aymerick', 'Adrien', 'Khadija', 'Cherif'];
let objects = ['apple', 'compas', 'drill', 'charger', 'netflix', 'cap', 'watch', 'glasses' ];
let ext = ".png"
class Card{
    constructor(name, photo, objects = []){
        this.name= name;
        this.photo=photo;
        this.objects=objects;
      }
  };
  
  let card1 = new Card(cardsNames[0], cardsNames[0].toLowerCase()+ext, [objects[0], objects[3], objects[6]]);
  let card2 = new Card(cardsNames[1], cardsNames[1].toLowerCase()+ext, [objects[0], objects[1], objects[6]]);
  let card3 = new Card(cardsNames[2], cardsNames[2].toLowerCase()+ext, [objects[0], objects[4], objects[7]]);
  let card4 = new Card(cardsNames[3], cardsNames[3].toLowerCase()+ext, [objects[2], objects[6]]);
  let card5 = new Card(cardsNames[4], cardsNames[4].toLowerCase()+ext, [objects[0], objects[7], objects[5]]);
  let card6 = new Card(cardsNames[5], cardsNames[5].toLowerCase()+ext, [objects[0], objects[4]]);
  let card7 = new Card(cardsNames[6], cardsNames[6].toLowerCase()+ext, [objects[1], objects[3], objects[7]]);
  let card8 = new Card(cardsNames[7], cardsNames[7].toLowerCase()+ext, [objects[2], objects[5], objects[6]]);
  let card9 = new Card(cardsNames[8], cardsNames[8].toLowerCase()+ext, [objects[1], objects[2], objects[7]]);
  let card10 = new Card(cardsNames[9], cardsNames[9].toLowerCase()+ext, [objects[1], objects[4]]);
  let card11 = new Card(cardsNames[10], cardsNames[10].toLowerCase()+ext, [objects[3], objects[6]]);
  let card12 = new Card(cardsNames[11], cardsNames[11].toLowerCase()+ext, [objects[4], objects[5]]);
  let card13 = new Card(cardsNames[12], cardsNames[12].toLowerCase()+ext, [objects[4], objects[7]]);
  
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


function distribute(collection, nameList, players){
  console.log("enter funct");
  let i=0;
  shuffle(collection);

  for(let player of players){
    player.emit('distribute', {
      cards : collection.slice(i, i+=3),
      names : nameList
    });
  }

}

function getRepFromPlayers(column) {
  let rep = ['NON', 'NON', 'NON', 'NON'];

  let play1 = deck[0].objects.concat(deck[1].objects).concat(deck[2].objects);
  let play2 = deck[3].objects.concat(deck[4].objects).concat(deck[5].objects);
  let play3 = deck[6].objects.concat(deck[7].objects).concat(deck[8].objects);
  let play4 = deck[9].objects.concat(deck[10].objects).concat(deck[11].objects);

  for (let object of play1){
    if(object == column){
      rep[0]= 'OUI';
    }
  }
  for (let object of play2){
    if(object == column){
      rep[1]= 'OUI';
    }
  }
  for (let object of play3){
    if(object == column){
      rep[2] = 'OUI';
    }
  }
  for (let object of play4){
    if(object == column){
      rep[3] = 'OUI';
    }
  }
  return rep;
}


function getRepFromPlayer(column, player) {
  let rep = 0;

  if (player == 0){
    let objects = deck[0].objects.concat(deck[1].objects).concat(deck[2].objects);
    for(let object of objects){
      if (object == column){
        rep++;
      }
    }
  }

  if (player == 1){
    let objects = deck[3].objects.concat(deck[4].objects).concat(deck[5].objects);
    for(let object of objects){
      if (object == column){
        rep++;
      }
    }
  }

  if (player == 2){
    let objects = deck[6].objects.concat(deck[7].objects).concat(deck[8].objects);
    for(let object of objects){
      if (object == column){
        rep++;
      }
    }
  }

  if (player == 3){
    let objects = deck[9].objects.concat(deck[10].objects).concat(deck[11].objects);
    for(let object of objects){
      if (object == column){
        rep++;
      }
    }
  }

  return rep;
}
// Chatroom

var numUsers = 0;
var socketList = [];
var nameList=[];
var currentTurn = 0;
var endGame = false;

io.on('connection', (socket) => {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socketList.push(socket);
    nameList.push(username);

    if (numUsers == 4){
      distribute(deck, nameList, socketList);

      socketList[currentTurn].emit('turn', true);
      socketList[currentTurn].broadcast.emit('turn', false);

    }

  });

  function nextTurn() {
    
    console.log('change player');
   
      if(currentTurn == 3){
        currentTurn = 0;
      }else{
        currentTurn +=1;
      }

      socketList[currentTurn].emit('turn', true);
      socketList[currentTurn].broadcast.emit('turn', false);
    
  }



  socket.on('question', (data) =>{
    var rep;
    var target = 0;

    if(data[0] == 4){
       rep = getRepFromPlayers(data[1]);
       console.log(rep);
    }else if(data[0] < 4){
       rep = getRepFromPlayer(data[1], data[0]);
       console.log(rep);
    }

    switch (data[1]) {
            case 'apple':
              target = 0;
              break;
    
            case 'compass':
              target = 1;
              break;
            
            case 'drill':
              target = 2;
              break;
    
            case 'charger':
              target = 3;
              break; 
    
            case 'netflix':
              target = 4;
              break; 
    
            case 'cap':
              target = 5;
              break; 
    
            case 'watch':
              target = 6;
              break; 
    
            case 'glasses':
              target = 7;
              break;  
    
          }

    io.emit('answer', [data[0], target, rep]);

    nextTurn();
  });
  

  socket.on('accuse', (thief) => {
    console.log('thief = '+deck[12].name);
    if (deck[12].name == thief){
      socket.emit('verdict', 'winner');
      socket.broadcast.emit('verdict', 'looser');
    }else{
      socket.emit('verdict', 'looser');
      nextTurn();
    }
  });

  // when the client emits 'typing', we broadcast it to others
  // socket.on('typing', () => {
  // socket.broadcast.emit('typing', {
  //     username: socket.username
  //   });
  // });

  // when the client emits 'stop typing', we broadcast it to others
  // socket.on('stop typing', () => {
  //   socket.broadcast.emit('stop typing', {
  //     username: socket.username
  //   });
  // });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      // socket.broadcast.emit('user left', {
      //   username: socket.username,
      //   numUsers: numUsers
      // });
    }
  });
});
