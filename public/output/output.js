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
let turnUser;
let turnImage;;
let turnExpecting;
let turnEndTime;

let canvasWidth;
let canvasHeight;

// state vars
let expectingShake;
let expectingFlip;

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

  // remove disconnected users
  socket.on('disconnected', function(id){
    delete users[id];
  });
}

// create new user
function createNewUser(id, user) {
  users[id] = {
    username: user,
    myTurn: false,
    shook: true,
    flipped: false,
    lives: 3
  }
}

function draw() {
  background(255);
  textFont("Press Start 2P");
  textSize(18);

  if (Object.keys(users).length == 0) {
    text("Waiting for players...", 100, 100);
    return;
  }

  // [DONE] GAME AREA
  // create space in main part of screen for burger, fry, etc images
  // add countdown time under that?
  gameArea();

  // [DONE] SCOREBOARD SIDEBAR
  //
  // create sidebar space for username + lives scoreboard
  // loop through users{} to display the usernames, stored as users[id].username
  // in that loop, get the value of each users[id].burgerLives and draw amount of burger images equal to that val
  scoreboard();

  // GENERATE IMAGES
  //
  // call generateImage() function to get an image
  //

  // SHAKE EVENT
  //
  // call shakeEvent() when any image but a hamburger is displayed on output screen
  // get current time in seconds
  // ...wait x number of seconds (3?), listening for socket.on('shake', ...) event
  //
  // check each users[id].shook && users[id].myTurn
  // if myTurn = false && shook = true, they shook when they weren't supposed to, call loseLife(users[id]);
  // if myTurn = true && shook = false, they were supposed to shake but they didn't, call loseLife(users[id]);
  // if myTurn = true && shook = true, they were supposed to shake and did, nothing happens
  //
  // return to generateImage()


  // FLIP EVENT
  //
  // a hamburger is displayed on output screen
  // listen for socket.on('flip', ...) events from all users
  // as each user meets the flip event criteria, push their socket.id into the flipOrder array
  // as a result, whoever the last user was to flip their phone will be the last socket.id in the array
  // after x amount of seconds (3? 5?), get the last item in the flipOrder array (flipOrder[-1])
  // call loseLife(flipOrder[-1]);
  // clear flipOrder;
  //
  // return to generateImage()
}

function gameArea() { // random user, random image, countdown in canvas
  let currentTime = millis();

  // If we have a new turn, update all our turn variables
  if (turnNew) {
    // 1. set turnImage. burger = 0, other images = 1-4
    turnImage = random(images);
    if (images.indexOf(turnImage) == 0) {             // burger
      turnExpecting = 'flip';
    } else {                            // anything else
      turnExpecting = 'shake';
    }

    // 2. set turnUser. Random selection!
    let randomUserId = random(Object.keys(users));
    turnUser = users[randomUserId];

    // 3. set turnEndtime so we know when turn is over.
    turnEndTime = currentTime + 3000;

    // NOTE: This is super hacky for now, but reset turnNew = true every 5 seconds
    setTimeout(function() {
      turnNew = true;
    }, 5000);
  }
  turnNew = false;

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

function addUsers() {
  let output = '';
  let burgerImg = '<img class="lives" src="burger.png" />';

  for (let id in users) {
    if (users[id].username == undefined) continue; // why doesn't this work?
    let user = users[id];
    let lives = user.lives;

    // create a div for each user
    let playerDiv = '<div class="user" id="player-' + id + '">';

    // add the user's username to the div
    playerDiv += user.username + '&nbsp;&nbsp';

    // loop through users lives count to add hamburger image for each life
    for (let j = 0; j < lives; j++) {
      playerDiv += burgerImg;
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
  push();
  fill('magenta');
  textAlign(CENTER);
  textSize(120);
  text(turnUser.username, 0, 0, canvasWidth, 100);
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
  const timeoutText = 'YO BURGER GOT COOKED!';

  if (timeLeft < 0) {
    push();
    fill('magenta');
    textAlign(CENTER);
    textSize(48);
    text(timeoutText, 0, 100, canvasWidth, 100);
    pop();
    return;
  }

  push();
  fill('magenta');
  textAlign(CENTER);
  textSize(48);
  let countdownSeconds = floor(timeLeft / 1000);
  let countdownMillis = floor((timeLeft % 1000) / 100);
  text("Countdown: ", 0, 100, canvasWidth, 100);
  text(`${countdownSeconds}.${countdownMillis}`, 0, 200, canvasWidth, 200); // update X&Y vals to be inside defined area
  pop();
}

// function shakeEvent() {
//   socket.on('shook', function(message) {
//     let id = message.id;
//     let pos = message.data;
//     let shaking = false;
//     let user = users[id];
//
//     // add logic here to know when user shakes their phone
//     // ex. if(vel.x > 5 && vel.y > 5) shaking = true;
//   });
// }

// function flipEvent() {
//   socket.on('flipped', function(message) {
//     let id = message.id;
//     let pos = message.data;
//     let user = users[id];
//
//     // add logic here to know when user flips their phone
//     // ex. if(pos.x < 5 && pos.y < 5) flipped = true;
//   });
// }

function loseLife(id) {
  id.lives -= 1; // remove 1 life from users total burgerLives
  socket.emit('removeLife', id); // server.js will need a listener function for this
}
