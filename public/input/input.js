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
}

// create new user
function createNewUser(id, user) {
  users[id] = {
    username: user
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
  }

  // test circle
  ellipse(20,20,20,20);
}

function enterPlayMode() {
  console.log("playMode()");
  gameState = "playing";

  socket.emit('username', usernameInput.value());

  playButton.remove();
  usernameInput.remove();
}
