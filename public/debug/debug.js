let socket = io('/debug');
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
    lastShookAt: null,
    lastTiltedAt: null
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

  socket.on('user_tilted', function(user) {
    let id = user.id;

    if (!(id in users)) {
      createNewUser(id);
    }

    console.log(users);
    users[id].lastTiltedAt = millis();
  });

  socket.on('user_shook', function(user) {
    let id = user.id;

    if (!(id in users)) {
      createNewUser(id);
    }
    console.log(users);

    users[id].lastShookAt = millis();
  });

  DEBUG_COLOR = randomColor();
}

function draw() {
  background('lightgoldenrodyellow');

  let angleSpace = 360 / Object.keys(users).length;
  let centerDistance = 200;
  let count = 0;
  let currentTime = millis();

  for (let key in users) {
    let user = users[key];
    let centerX = windowWidth / 2;
    let centerY = windowHeight / 2;

    push();
    fill(user.color);

    translate(centerX, centerY);
    rotate(radians(user.rotationX));
    rectMode(CENTER);
    if (user.lastShookAt && user.lastShookAt > currentTime - 1000) {
      rect(0, 0, 150, 150);
    } else {
      rect(0, 0, 100, 10);
    }

    fill('cyan');
    ellipse(50, 0, 10, 10);
    pop();

    count++;
  }

  if (DEBUG) { debug(); }
}

function debug() {
  // visual refresh indicator
  fill(DEBUG_COLOR);
  rect(0, 0, 100, 100);
}
