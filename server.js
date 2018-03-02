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

// Listen for individual clients to connect
io.sockets.on('connection',
  // Callback function on connection
  // Comes back with a socket object
  function(socket) {

    console.log("We have a new client: " + socket.id);

    // Listen for this client to disconnect
    // Tell everyone client has disconnected
    socket.on('disconnect', function() {
      io.sockets.emit('disconnected', socket.id);
    });

    // socket.on('sushi_update', function(sushiChanges) {
    //   let payload = {
    //     cornerX: sushiChanges.cornerX,
    //     cornerY: sushiChanges.cornerY
    //   }
    //
    //   io.sockets.emit('changes_made_to_sushi_location', payload)
    // });
  }
);
