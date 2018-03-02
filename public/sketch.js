let socket = io();
let users = {};

const DEBUG = true;
let DEBUG_COLOR;

function randomColor() {
  return color(random(255), random(255), random(255));
}

function createNewUser(id) {
  users[id] = {
    color: randomColor(),
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  socket.on('connect', function() {
    console.log("Connected");
  });

  socket.on('disconnected', function(id) {
    delete users[id];
  });

  socket.on('user_updated', function(userChanges) {
    let id = userChanges.id;

    if (!(id in users)) {
      createNewUser(id);
    }

    users[id] = Object.assign(users[id], userChanges);
  });

  DEBUG_COLOR = randomColor();
}

let lastSentTime = 0;
function emitFoo(currentTime) {
  if (currentTime - lastSentTime < 100) {
    return;
  }

  socket.emit("update_user", {
    rotationZ: rotationZ,
    rotationX: rotationX,
    rotationY: rotationY,
    faceDown: abs(rotationX) > 175 // flat tolerance
  });

  lastSentTime = currentTime;
}

function draw() {
  background('lightgoldenrodyellow');

  let count = 0;
  let xGrid = windowWidth / (Object.keys(users).length + 1);
  let yGrid = windowHeight / 4;

  // info
  fill('magenta');
  textSize(48);
  text('rotationX', 0, yGrid*1);
  text('rotationY', 0, yGrid*2);
  text('rotationZ', 0, yGrid*3);

  for (let key in users) {
    count++;
    let user = users[key];
    let centerX = xGrid * count;

    fill(user.color);

    push();
    translate(centerX, yGrid);
    rotate(radians(user.rotationX));
    rectMode(CENTER);
    if (user.faceDown) {
      rect(0, 0, 150, 150);
    } else {
      rect(0, 0, 100, 10);
    }
    fill('cyan');
    ellipse(50, 0, 10, 10);

    textAlign(CENTER);
    textSize(24);
    text(user.rotationX || "NONE", 0, -60);
    pop();

    push();
    translate(centerX, yGrid * 2);
    rotate(radians(user.rotationY));
    rectMode(CENTER);
    rect(0, 0, 100, 10);
    fill('cyan');
    ellipse(50, 0, 10, 10);

    textAlign(CENTER);
    textSize(24);
    text(user.rotationY || "NONE", 0, -60);
    pop();

    push();
    translate(centerX, yGrid * 3);
    rotate(radians(user.rotationZ));
    rectMode(CENTER);
    rect(0, 0, 100, 10);
    fill('cyan');
    ellipse(50, 0, 10, 10);

    textAlign(CENTER);
    textSize(24);
    text(user.rotationZ || "NONE", 0, -60);
    pop();
  }

  emitFoo(millis());

  if (DEBUG) { debug(); }
}

function debug() {
  // visual refresh indicator
  fill(DEBUG_COLOR);
  rect(0, 0, 100, 100);
}
