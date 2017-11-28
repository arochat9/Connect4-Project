const app = require('./app.js');
const games = require('./games.js');
const users = require('./users.js'); 
   User = users.User;
   users = users.user;
const socketio = require('socket.io');
const io = socketio.listen(app);

io.sockets.on('connection', function(socket){
   socket.on('startup', () => { /* nothing for now */ });
   socket.on('login_attempt', (data) => {
      var user = new User(data['username'], socket);
      var result = users.add_user(user);
      if( result === true ){
         socket.emit('login_result', { result: 'success', username: username });
         games.send_types(user);
         games.send_active(user);
      } else {
         socket.emit('login_result', { result: 'failure', jreason: result });
      }
   })
});

console.log('Started up.');