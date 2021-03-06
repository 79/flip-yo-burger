// Open and connect output socket
let socket = io('/output');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

let users = {}; // track users
let flipOrder = []; // track order users flipped their phones in
let images = []; // array of URLs pointing to all images except burger

// Keeping track of turns
let turnNew = true;
let turnEnd = false;
let turnUser;
let turnImage;
let turnExpecting; // null / 'shake' / 'flip'
let turnEndTime;
let turnSuccess = null;

let gameWinner;
let gameState = "waiting";

let canvasWidth;
let canvasHeight;

// DEBUG
// createNewUser("foo", "FOO");
// createNewUser("bar", "BAR");
// createNewUser("qux", "QUX");
// createNewUser("wtf", "WTF");

function setup() {
  canvasWidth = windowWidth * 0.73;
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);

  // define game images
  const burgerIMG = loadImage("burger.png");
  const friesIMG = loadImage("fries.jpg");
  const milkshakeIMG = loadImage("milkshake.jpg");
  const hotdogIMG = loadImage("hotdog.jpg");
  const chipsIMG = loadImage("chips.jpg");

  // add new users
  socket.on('new_user', function (message) {
    let id = message.id;
    let username = message.username;

    // username doesn't already exist, creat them as a new user
    if (!(id in users)) {
      createNewUser(id, username);
    }
  });

  // add image URLs
  images.push(burgerIMG, friesIMG, milkshakeIMG, hotdogIMG, chipsIMG);

  socket.on('remove_life', function(user_id) {
    console.log('remove_life received');
    users[user_id].lives = users[user_id].lives - 1;
  });

  // SHAKE EVENT
  //
  // when any image but a hamburger is displayed on output screen
  // get current time in seconds
  // ...wait x number of seconds (3?), listening for socket.on('shake', ...) event
  //
  // check each users[id].shook && users[id].myTurn
  // if myTurn = false && shook = true, they shook when they weren't supposed to, call loseLife(users[id]);
  // if myTurn = true && shook = false, they were supposed to shake but they didn't, call loseLife(users[id]);
  // if myTurn = true && shook = true, they were supposed to shake and did, nothing happens
  socket.on('user_shook', function(user) {
    if (!turnUser) return;

    let id = user.id;
    console.log(id, " shook");

    // We're going to be sloppy here and just record all turn actions
    flipOrder.push(id);

    // If event is from correct user and no event sent yet...
    if (turnSuccess == null && turnUser.id == id) {
      if (turnExpecting == 'shake') {
        turnSuccess = true;
      } else {
        turnSuccess = false;
      }
    }
  });

  // FLIP EVENT
  //
  // a hamburger is displayed on output screen
  // listen for socket.on('flip', ...) events from all users
  // as each user meets the flip event criteria, push their socket.id into the flipOrder array
  // as a result, whoever the last user was to flip their phone will be the last socket.id in the array
  // after x amount of seconds (3? 5?), get the last item in the flipOrder array (flipOrder[-1])
  // call loseLife(flipOrder[-1]);
  // clear flipOrder;
  socket.on('user_flipped', function(user) {
    if (!turnUser) return;

    let id = user.id;
    console.log(id, " flipped");

    // We're going to be sloppy here and just record all turn actions
    flipOrder.push(id);

    // If event is from correct user and no event sent yet...
    if (turnSuccess == null && turnUser.id == id) {
      if (turnExpecting == 'flip') {
        turnSuccess = true;
      } else {
        turnSuccess = false;
      }
    }
  });

  // remove disconnected users
  socket.on('disconnected', function(id) {
    delete users[id];
  });
}

// create new user
function createNewUser(id, user) {
  users[id] = {
    id: id,
    username: user,
    myTurn: false,
    shook: true,
    flipped: false,
    lives: 3
  }
}

function draw() {
  background(255);
  textFont("Consolas");

  // [DONE] SCOREBOARD SIDEBAR
  //
  // create sidebar space for username + lives scoreboard
  // loop through users{} to display the usernames, stored as users[id].username
  // in that loop, get the value of each users[id].burgerLives and draw amount of burger images equal to that val
  scoreboard();

  // [DONE] WAIT FOR PLAYERS
  if (Object.keys(users).length < 2) {
    titleText("Waiting for players... ");
    return;

  }

  // [DONE] START GAME
  if (gameState == "waiting") {
    if (second() % 2 == 0) return;

    titleText("PRESS [SPACE] TO START");
    return;
  }

  // [DONE] GAME AREA
  // create space in main part of screen for burger, fry, etc images
  // add countdown time under that?
  if (isGameOver()) {
    displayGameOver();
  } else {
    gameArea();
  }
}

// Helper to display something in the middle...
function titleText(title) {
  push();
  fill('black');
  textAlign(CENTER, CENTER);
  let fontSize = canvasWidth / title.length;
  textSize(floor(fontSize));
  text(title, 0, 0, canvasWidth, canvasHeight);
  pop();
}

function isGameOver() {
  let aliveUsers = Object.values(users).filter(function(user) { return user.lives > 0; });

  if (aliveUsers.length > 1) {
    return false;
  }

  gameWinner = aliveUsers[0].id;
  return true;
}

function displayGameOver() {
  push();
  fill('magenta');
  textAlign(CENTER, CENTER);
  textSize(120);
  let winner = users[gameWinner];
  text(winner.username, 0, canvasHeight - 400, canvasWidth, 200);
  text("🏆", 0, 0, canvasWidth, canvasHeight);
  pop();
}

function gameArea() { // random user, random image, countdown in canvas
  let currentTime = millis();

  // If we have a new turn, update all our turn variables
  if (turnEnd) {
    turnEnd = false;

    // 1. Process previous turn
    if (turnExpecting === 'shake' && !turnSuccess) {
      socket.emit('remove_life', turnUser.id);
    }

    if (turnExpecting === 'flip') {
      for (let key in users) {
        if (flipOrder.indexOf(key) == -1) {
          socket.emit('remove_life', key);
        }
      }
    }

    flipOrder = [];

    setTimeout(function() {
      turnNew = true;
    }, 3000);
  }

  if (turnNew) {
    turnNew = false;
    turnSuccess = null;

    // 1. set turnImage. burger = 0, other images = 1-4
    turnImage = random(images);
    if (images.indexOf(turnImage) == 0) {             // burger
      turnExpecting = 'flip';
    } else {                            // anything else
      turnExpecting = 'shake';
    }

    // 2. set turnUser. Random selection!
    let aliveUsers = Object.values(users).filter(function(user) { return user.lives > 0; });
    let randomUser = random(aliveUsers);
    turnUser = users[randomUser.id];

    // 3. set turnEndtime so we know when turn is over.
    turnEndTime = currentTime + 2000;

    // NOTE: This is super hacky for now, but reset turnNew = true every 5 seconds
    setTimeout(function() {
      turnEnd = true;
    }, 2000);
  }

  displayUser();
  displayImage();
  displayCountdown(turnEndTime - currentTime);
}

function scoreboard() { // generate the scoreboard in right column div with ID 'scoreboard'
  // scoreboard div
  scoreboardDiv = select('#scoreboard');

  // add game name & scoreboard text
  scoreHeaderDiv = select('#scoreHeader');
  scoreHeaderDiv.html('<h1>BURGER FLIPPER</h1><br /><h3>Scoreboard</h3>');

  if(Object.keys(users).length > 0) {
    // dynamically generate user area
    userDiv = select('#users');
    userDiv.html(addUsers());
  }
}

// NOTE TO SELF: This is getting re-rendered in the draw loops. Not good, right?
function addUsers() {
  let output = '';
  let burgerImg = '<span class="lives">🍔</span>';
  let flameImg = '<span class="lives">🔥</span>';

  for (let id in users) {
    if (users[id].username == undefined) continue; // why doesn't this work?
    let user = users[id];
    let lives = user.lives;

    // create a div for each user
    let playerDiv = '<div class="user" id="player-' + id + '">';

    // add the user's username to the div
    playerDiv += user.username + '&nbsp;&nbsp';

    // loop through users lives count to add hamburger image for each life
    for (let j = 0; j < 3; j++) {
      if (j < lives) {
        playerDiv += burgerImg;
      } else {
        playerDiv += flameImg;
      }
    }

    // close the div
    playerDiv += '</div>'

    // add all of the above to the output HTML string
    output += playerDiv;
  }

  return(output);
}

// put next user's username at the top!
function displayUser() {
  if (!turnUser) return;

  if (turnExpecting === 'flip') {
    return;
  }

  push();

  fill('magenta');
  textAlign(CENTER);
  textSize(120);

  text(turnUser.username, 0, canvasHeight - 200, canvasWidth + 50, 200);

  switch (turnSuccess) {
    case true:
      text("🤘", 0, canvasHeight - 350, canvasWidth + 50, 200);
      break;
    case false:
      text("😭", 0, canvasHeight - 350, canvasWidth + 50, 200);
      break;
  }

  pop();
}

// put the image on screen
function displayImage() {
  push();
  translate(canvasWidth / 2, canvasHeight / 2);
  image(turnImage, -200, -200, 400, 400);
  pop();
}

// this function generates a 3 sec countdown timer under the image
function displayCountdown(timeLeft) {
  if (timeLeft < 0) {

    push();
    fill('magenta');
    textAlign(CENTER, CENTER);
    textSize(64);

    if (turnExpecting == 'flip') {
      const timeoutText = '🔥YO BURGER GOT COOKED!🔥';
      text(timeoutText, 0, 0, canvasWidth + 50, 200);
    } else {
      if (turnSuccess) {
        text("🎉", 0, 0, canvasWidth + 50, 200);
      } else {
        text("🙈", 0, 0, canvasWidth + 50, 200);
      }
    }
    pop();
    return;
  }

  push();
  fill('magenta');
  textAlign(CENTER, CENTER);
  textSize(96);
  let countdownSeconds = floor(timeLeft / 1000);
  let countdownMillis = floor((timeLeft % 1000) / 100);
  text(`${countdownSeconds}.${countdownMillis}`, 0, 0, canvasWidth + 50, 200); // update X&Y vals to be inside defined area
  pop();
}

function keyPressed() {
  console.log(key)
  if (key === ' ' && gameState == 'waiting') {
    gameState = 'starting';
  }

  // DEBUG controls
  if (key === 'F') {
    socket.emit('flipped', 'foo');
  }

  if (key === 'S') {
    socket.emit('shook', 'foo');
  }
}
