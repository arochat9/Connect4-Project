const users = require('./users.js');
const {io} = require('./app.js');
const game = require('./game.js');

exports.login_attempt = function(data, socket) {
   var {username, password} = data;
   var result = users.add_user(username, password, socket);
   if( typeof result === 'string' ){
      socket.emit('login:result', { result: 'failure', reason: result });
      console.log(`Couldn't log in user '${username}': ${result}`);
   } else {
      var user = result;
      socket.emit('login:result', { result: 'success', username });
      console.log(`User '${username}' logged in.`);
      socket.on( 'game:random', () => game.matchmake_random(user) );
      socket.on( 'chat:message',  data => chat_message(data, socket) );
      socket.on( 'chat:private',  data => private_message(data, socket) );
      socket.on( 'userlist:startup', () => user_joined(socket) );
   }
}

private_message = function(data, socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   var {to, text} = data;
   var to_user = users.from_username(to);
   if( !to_user || user.room !== to_user.room ){
      user.servermsg_private(`User '${to}' isn't in your current chatroom!`);
      return;
   }
   var msg = { from: user.username, to, text };
   user.socket.emit('chat:private', msg);
   to_user.socket.emit('chat:private', msg);

}

chat_message = function(data, socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   var {username, room} = user, text = data.text;
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
   if( user.game )
      user.game.game.quit_game();
   users.delete_socket(socket);
}

user_joined = function(socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   io.in(user.room).emit('userlist:user_joined', { username: user.username });
   var clients = io.sockets.adapter.rooms[user.room].sockets;

   for(var socket_id in clients){
      var their_socket = io.sockets.connected[socket_id];
      if( !their_socket ){
         console.error("We have an undefined person in the chatroom?? (1)");
         continue;
      }
      var other = users.from_socket(their_socket);
      if( !other ){
         console.error("We have an undefined person in the chatroom?? (2)");
         continue;
      }
      if( other.username !== user.username )
         socket.emit('userlist:user_joined', { username: other.username });
   }
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
