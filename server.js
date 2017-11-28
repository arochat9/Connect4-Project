const app = require('./app.js');
const games = require('./games.js');
const users = require('./users.js');
const socketio = require('socket.io');
const io = socketio.listen(app);

io.sockets.on('connection', function(socket){
   socket.on('startup', () => { /* nothing for now */ });
   socket.on('login-attempt', (data) => {
      var username = data['username'];
      if( !users.login_user(username, socket) )
         return;
      games.send_types(socket);
      games.send_active(socket);
   })
});

console.log('Started up.');