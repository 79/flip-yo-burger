  // Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function() {
  console.log('Server listening at port: ', port);
});

// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Namespace input
var inputs = io.of("/input");
var outputs = io.of("/output");
var debug = io.of("/debug");

debug.on('connection',
  function(socket) {
    console.log("We have a new debug client");
  }
);

// Listen for individual clients to connect
inputs.on('connection',
  // Callback function on connection
  // Comes back with a socket object
  function(socket) {

    console.log("We have a new client: " + socket.id);

    socket.on('disconnect', function() {
      io.sockets.emit('disconnected', socket.id);
    });

    socket.on('update_user', function(userUpdates) {
      let payload = {
        id: socket.id,
        rotationX: userUpdates.rotationX,
        rotationY: userUpdates.rotationY,
        rotationZ: userUpdates.rotationZ,
        faceDown: userUpdates.faceDown
      }

      io.sockets.emit('user_updated', payload);
    });

    socket.on('username', function (usernameChanged) {
      console.log(usernameChanged);

      let payload = {
        id: socket.id,
        username: usernameChanged,
        lives: 3
      }

      inputs.emit('new_user', payload);
      outputs.emit('new_user', payload);
      debug.emit('new_user', payload);
    });

    socket.on('shook', function(isShaken) {
      console.log('received a shake event from', socket.id);

      outputs.emit('user_shook', { id: socket.id });
    });

    socket.on('flipped', function(isTilted) {
      console.log('received a flip event from', socket.id);

      outputs.emit('user_flipped', { id: socket.id });
    });
  }
);

outputs.on('connection',
  function(socket) {
    console.log("We have a new output client: " + socket.id);

    socket.on('disconnect', function() {
      io.sockets.emit('disconnected', socket.id);
    });

    socket.on('remove_life', function(id) {
      inputs.emit('remove_life', id);
      outputs.emit('remove_life', id);
    });

    // DEBUG
    socket.on('shook', function(isShaken) {
      console.log('received a shake event from', socket.id);

      outputs.emit('user_shook', { id: socket.id });
    });

    socket.on('flipped', function(isTilted) {
      console.log('received a flip event from', socket.id);

      outputs.emit('user_flipped', { id: socket.id });
    });
  }
);
