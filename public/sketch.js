let socket = io();
let users = {};

const DEBUG = true;
let DEBUG_COLOR;

let socket_id;

function createNewUser(id) {
  users[id] = {
    foo: 'bar'
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

  // socket.on('a_user_was_updated', function(userChanges) {
  //   let id = userChanges.id;
  //
  //   if (!(id in users)) {
  //     createNewUser(id);
  //   }
  //
  //   let chopstick = users[id].chopstick;
  //   chopstick.updateAngle(userChanges.angle);
  //   chopstick.updateCenter(userChanges.centerX, userChanges.centerY);
  // });

  DEBUG_COLOR = color(random(255), random(255), random(255));
}

let lastSentTime = 0;
function emitFoo(currentTime) {
  if (currentTime - lastSentTime < 50) {
    return;
  }

  // socket.emit('user_update', {
  //   centerX: mouseX,
  //   centerY: mouseY,
  //   angle: angle
  // });

  lastSentTime = currentTime;
}

function draw() {
  background('lightgoldenrodyellow');






  if (DEBUG) { debug(); }
}

function debug() {
  // visual refresh
  fill(DEBUG_COLOR);
  rect(0, 0, 50, 50);
}
