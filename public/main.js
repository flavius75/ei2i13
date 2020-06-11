$(function() {
  var FADE_TIME = 150; // ms
 
  $('.dropdown-toggle').dropdown()


  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $blockPage = $('.block.page');
  var $waitingPage = $('.waiting.page');

  // Prompt for setting a username
  var username;
  var rang = false;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  const addParticipantsMessage = (data) => {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  //Show players into tha table
  const showPlayers = (data) => {
   
    $('.play1').text(data[0]);
    $('.play2').text(data[1]);
    $('.play3').text(data[2]);
    $('.play4').text(data[3]);
  }

  const showCards = (cards) => {

    $('#card1').attr('src', 'cards/'+cards[0].photo);
    $('#card2').attr('src', 'cards/'+cards[1].photo);
    $('#card3').attr('src', 'cards/'+cards[2].photo);
  }

  const getOwnObjects = (cards) => {
    let ownObjects =[];

    for(let card of cards){
      ownObjects = ownObjects.concat(card.objects);
      };
    
    console.log(ownObjects);
    
    let ownLine = [0, 0, 0, 0, 0, 0, 0, 0];

    for(let object of ownObjects){
      switch (object) {
        case "apple":
          ownLine[0]++;
          break;
    
        case "compass":
          ownLine[1]++;
          break;
        
        case "drill":
          ownLine[2]++;
          break;  
        
        case "charger":
          ownLine[3]++;
          break;
        
        case "netflix":
          ownLine[4]++;
          break;
        
        case "cap":
          ownLine[5]++;
          break;
        
        case "watch":
          ownLine[6]++;
          break;  

        case "glasses":
          ownLine[7]++;
          break;  
      };
      };

     return ownLine;

  }

  const getRang = (players) => {
    for(let i in players){
        if(players[i] == username){
          return i;
        }
      };
  }


  const updateTable = (target, elements, orientation) => {
    if(orientation == 'horizontal'){

      for(i=0; i<8; i++){
        $('.'+target+''+i).text(elements[i]);
  
      }
    }else if(orientation == 'vertical'){
   
      for(i=0; i<4; i++){
        if (i== rang) {
          continue;
        }
        $('.'+i+''+target).text(elements[i]);
      
      }
    }
  }


  // Sets the client's username
  const setUsername = () => {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $waitingPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  socket.on('start game', () => {
    $waitingPage.fadeOut();
    $chatPage.show();
  });

  // Sends a chat message
  const sendMessage = () => {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
    const log = (message, options) => {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  const addChatMessage = (data, options) => {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  const addChatTyping = (data) => {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el, options) => {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  const cleanInput = (input) => {
    return $('<div/>').text(input).html();
  }



  // Keyboard events

  $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', () => {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(() => {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(() => {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', (data) => {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });


  socket.on('block user', (data) =>{
    if(data){

      $chatPage.fadeOut();
      $waitingPage.fadeOut();
      $blockPage.show();
    }
  })

  //Show Cards distributed
  socket.on('distribute', (data) => {
    showPlayers(data.names);
    showCards(data.cards);
    let objects = getOwnObjects(data.cards);
    rang = getRang(data.names);
    updateTable(rang, objects, 'horizontal');

  });

  $('.question').on('click', () => {
      var destination = $('#destination').find(':selected').val();
      var object = $('#q-object').find(':selected').val();
      var answer = 0;
      
      socket.emit('question', [destination, object]);

  });

  $('.accuse').on('click', () => {
    var thief = $('#thief').find(':selected').val();
   
    
    socket.emit('accuse', thief);


  });

  socket.on('verdict', (response) => {
    var sentence;
    if (response == 'looser'){
       sentence = 'Vous avez PERDU.';
    }else{
      sentence = "Vous avez GAGNE !";
    }

    $('.modal-body').text(sentence);
    $('#exampleModal').modal('show');
  });



  socket.on('answer', (data) => {
    answer = data;
    if (answer[0] == 4){

      updateTable(answer[1], answer[2], 'vertical');

    }else{
      
        $('.'+answer[0]+answer[1]).text(answer[2]);
    }

});

  socket.on('turn', (currentTurn)=> {

    if (currentTurn){
      $('#destination').removeAttr('disabled');
      $('#q-object').removeAttr('disabled');
      $('.question').removeAttr('disabled');
      $('#thief').removeAttr('disabled');
      $('.accuse').removeAttr('disabled');


    }else{
      $('#destination').attr('disabled', true);
      $('#q-object').attr('disabled', true);
      $('.question').attr('disabled', true);
      $('#thief').attr('disabled', true);
      $('.accuse').attr('disabled', true);

    }

  });

  $('.legend-row').on('click', function(e){
      $(this).toggleClass('table-active');
  })


  

});
