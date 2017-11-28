const app = require('./app.js'),
      socketio = require('socket.io'),
      io = socketio.listen(app);

var users = {}

io.sockets.on('connection', function(socket){
   socket.on('client-startup', () => {
      send_game_types(socket);
      send_games_list(socket);
   });
});

console.log('Started up.');