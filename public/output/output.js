// Open and connect output socket
let socket = io('/output');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

let users = {}; // track users
let flipOrder = []; // track order users flipped their phones in
let images = []; // array of URLs pointing to all images except burger

// state vars
let expectingShake;
let expectingFlip;

function setup() {
  createCanvas(windowWidth * .73, windowHeight);

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
  if(Object.keys(users).length > 0) {
    generateUser();
    generateImage();
    generateCountdown();
  } else {
    text("Waiting for players...", 100, 100);
  }
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
  let output;
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

function generateUser() { // this function randomly generates a current user
  let randomUserId = random(Object.keys(users));
  let user = users[randomUserId]; // get the user

  let username = user.username;
  user.myTurn = true;

  text(username, 100, 75); // update X&Y vals to wherever we put the username text
}

function generateImage() { // this function generates a random image (burger, fries, etc) on screen
   // random number 0 to 4, where burger = 0, other images = 1-4
  let randomImage = random(images);

  // put the image on screen
  image(randomImage, 100, 125); // update X&Y vals to be inside defined area

  if (randomImage == 0) {             // burger
    expectingFlip = true;
    generateCountdown();
  } else {                            // anything else
    expectingShake = true;
    shakeEvent();
  }
}

function generateCountdown() {  // this function generates a 3 sec countdown timer under the image
  let seconds = second();
  let timer = seconds + 3;
  const timeoutText = '&#x1F525;&#x1F525;&#x1F525;' + 'YO BURGER GOT COOKED! ' + '&#x1F525;&#x1F525;&#x1F525;'

  text("Countdown: ", 330, 75);
  text(timer - seconds, 400, 75); // update X&Y vals to be inside defined area

  if (frameCount % 60 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    timer--;
  }
  if (timer == 0) {
    //text(timoutText, 450, 75);
    if(expectingShake) {
      shakeEvent();
      expectingShake = false;
    } else {
      flipEvent();
      expectingFlip = false;
    }
  }
}

function shakeEvent() {
  socket.on('shook', function(message) {
    let id = message.id;
    let pos = message.data;
    let shaking = false;
    let user = users[id];

    // add logic here to know when user shakes their phone
    // ex. if(vel.x > 5 && vel.y > 5) shaking = true;
  });
}

function flipEvent() {
  socket.on('flipped', function(message) {
    let id = message.id;
    let pos = message.data;
    let user = users[id];

    // add logic here to know when user flips their phone
    // ex. if(pos.x < 5 && pos.y < 5) flipped = true;
  });
}

function loseLife(id) {
  id.lives -= 1; // remove 1 life from users total burgerLives
  socket.emit('removeLife', id); // server.js will need a listener function for this
}
