// Open and connect output socket
let socket = io('/output');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

let users = {}; // track users
let flipOrder[]; // track order users flipped their phones in
let images[]; // array of URLs pointing to all images except burger

function setup() {
  createCanvas(windowWidth, windowHeight);

  // add new users
  socket.on('username', function (message) {
    let id = message.id;
    let username = message.username;

    // username doesn't already exist, creat them as a new user
    if (!(id in users)) {
      createNewUser(id, username);
    }
  });

  // remove disconnected users
  socket.on('disconnected', function(id){
    delete users[id];
  });

  // add image URLs
  images.push('url1', 'url2', 'url3', 'url4', 'url5');
}

// create new user
function createNewUser(id, user) {
  users[id] = {
    username: user,
    myTurn: false,
    shook: true,
    flipped: false,
    burgerLives = 3
  }
}

function draw() {
  background(255);

  // create space in main part of screen for burger, fry, etc images
  // add countdown time under that?

  // create sidebar space for username + lives scoreboard
  // loop through users{} to display the usernames, stored as users[id].username 
  // in that loop, get the value of each users[id].burgerLives and draw amount of burger images equal to that val

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
  // as each user meets the flip event criteria, "unshift" their socket.id into the flipOrder array
  // as a result, whoever the last user was to flip their phone will be the last socket.id in the array
  // after x amount of seconds (3? 5?), get the last item in the flipOrder array (flipOrder[-1])
  // call loseLife(flipOrder[-1]);
  // clear flipOrder;
  //
  // return to generateImage()

  /* unshift() works the opposite of push() -- it adds values to the end of an array
  array = [1, 2, 3, 4]
  array.unshift(0)
  array = [1, 2, 3, 4, 0] */

}

function generateImage() { // this function generates a random image (burger, fries, etc) on screen
   // generate random number 1-6
   // burger = 1, other images = 2-6
  let imageChoice; 
  imageChoice = (Math.floor(Math.random() * 6)) + 1;

  if (imageChoice == 1) {             // burger
    // code to display burger image
    // draw the image
    flipEvent();
  } else {                            // anything else
    // code to display an image, randomly called from any array -- images[imageChoice]
    // draw the image
    shakeEvent();
  }
}

function shakeEvent() {
  socket.on('shake', function(message) {
    let id = message.id;
    let pos = message.data;
    let vel = {x: pos.x/8, y: pos.y/8}; // this will need to be changed
    let shaking = false;
    let user = users[id];

    // add logic here to know when user shakes their phone
    // ex. if(vel.x > 5 && vel.y > 5) shaking = true;
  });
}

function flipEvent() {
  socket.on('flip', function(message) {
    let id = message.id;
    let pos = message.data;
    let flipped = false;
    let user = users[id];

    // add logic here to know when user flips their phone
    // ex. if(pos.x < 5 && pos.y < 5) flipped = true;
  });
}

function loseLife(id) {
  id.burgerLives -= 1; // remove 1 life from users total burgerLives
  socket.emit('removeLife', id); // server.js will need a listener function for this
}
