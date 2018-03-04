// Open and connect output socket
let socket = io('/input');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

let users = {}; // track users


function setup() {

}

// create new user
function createNewUser(id, user) {
  users[id] = {
    username: user
  }
}

function draw() {
  background(255);

  // test circle
  ellipse(20,20,20,20);
}
