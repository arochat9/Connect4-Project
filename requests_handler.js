const users = require('./users.js');
const {io} = require('./app.js');

exports.login_attempt = function(data, socket) {
   var username = data.username;
   var result = users.add_user(username, socket);
   if( typeof result === 'string' ){
      socket.emit('login:result', { result: 'failure', reason: result });
      console.log(`Couldn't log in user '${username}': ${result}`);
   } else {
      var user = result;
      socket.emit('login:result', { result: 'success', username });
      console.log(`User '${username}' logged in.`);
   }
}

exports.chat_message = function(data, socket){
   var user = users.from_socket(socket);
   if( user === undefined ){
      console.error(`Socket tried to send a chat message, but wasn't connected`);
      return;
   }
   var username = user.username,
           room = user.room,
           text = data.text;
   if( !text )
      return;
   console.log(`User '${username}' (in '${room}') sent: ${text}`)
   io.in(room).emit('chat:message', { username, text });
}

exports.user_left = function(socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   console.log(`User '${user.username}' left. `)
   io.in(user.room).emit('userlist:user_left', { username: user.username });
   users.delete_socket(socket);
}

exports.user_joined = function(socket){
   var user = users.from_socket(socket);
   io.in(user.room).emit('userlist:user_joined', { username: user.username });
   var clients = io.sockets.adapter.rooms[user.room].sockets;
   for(var socket_id in clients){
      var ouser = users.from_socket(io.sockets.connected[socket_id]).username;
      if( ouser !== user.username )
         socket.emit('userlist:user_joined', { username: ouser });
   }
   user.start_game('yellow', 'global');
   socket.emit('game:start', { color: 'yellow' });
}

exports.start_game = function(data, socket){
   socket.emit('game:start', { color: 'yellow' });
   socket.to(room).emit('game:start', { color: 'red' });
}

exports.take_move = function(data, socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   var pos = data.pos;
   console.log(`Player ${user.username} took a move at ${pos}`);
   io.in(user.room).emit('game:take_move', {color: user.color, x: pos, y: pos });
   // socket.on( 'game:take_move', (data) => requests.take_move(data, socket) );
}
