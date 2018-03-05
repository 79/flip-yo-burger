// Open and connect output socket
let socket = io('/input');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

let users = {}; // track users
let gameState = 'starting';

let usernameInput;
let playButton;

function setup() {
  // create canvas
  createCanvas(windowWidth, windowHeight);

  usernameInput = createInput();
  usernameInput.position(20, 65);

  playButton = createButton('submit');
  playButton.position(usernameInput.x + usernameInput.width, 65);
  playButton.mousePressed(enterPlayMode);

  socket.on("new_user", function(userAttributes) {
    console.log("new_user event");
    let id = userAttributes.id;

    if (!(id in users)) {
      createNewUser(userAttributes);
    }
  });
}

// create new user
function createNewUser(attributes) {
  users[attributes.id] = {
    username: attributes.username,
    lives: attributes.lives
  }
}

function draw() {
  background('cyan');

  if (gameState == "starting") {
    fill('magenta');
    rect(0, 0, 500, 500);
  }

  if (gameState == "playing") {
    fill('yellow');
    rect(0, 0, 500, 500);

    // show only my user details
    let me = users[socket.id];
    if (me) {
      fill('black');
      textSize(120);
      textAlign(CENTER);
      text(me.username, 0, 0, windowWidth, 120);

      let centerX = windowWidth / 2;
      let centerY = windowHeight / 4;
      for (var i = 0; i < me.lives; i++) {
        push();
        fill(random(0,255));
        rectMode(CENTER);
        rect(centerX, centerY * (i + 1), 50, 50);
        pop();
      }
    }
  }

  // test circle
  ellipse(20,20,20,20);

  deviceTilted();
}

function enterPlayMode() {
  console.log("playMode()");
  gameState = "playing";

  socket.emit('username', usernameInput.value());

  playButton.remove();
  usernameInput.remove();
}

let lastShakeTime = 0;
function deviceShaken() {
  let currentTime = millis();

  if (currentTime - lastShakeTime < 2000) {
    return;
  }

  socket.emit('shook', true);
  lastShakeTime = currentTime;
}

let lastTiltTime = 0;
function deviceTilted() {
  let currentTime = millis();

  if (currentTime - lastTiltTime < 2000) {
    return;
  }

  // phone is face down
  if (abs(rotationX) > 170) {
    socket.emit("tilted", true);
    lastTiltTime = currentTime;
  }
}
