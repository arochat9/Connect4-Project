const users = require('./users.js');
const {io} = require('./app.js');
const game = require('./game.js');


// when someone attempts to register
exports.register_attempt = function(data, socket) {
   var {username, password} = data;
   var result = users.register_user(username, password);
   if( typeof result === 'string' ){
      socket.emit('register:result', { result: 'failure', reason: result });
      console.log(`Couldn't register user '${username}': ${result}`);
   } else {
      socket.emit('register:result', { result: 'success', username });
      console.log(`User '${username}' registered.`);
   }
}

// when someone attempts to login
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
      socket.on( 'game:friend', data => game.matchmake_friend(user, data) );
      socket.on( 'chat:message',  data => chat_message(data, socket) );
      socket.on( 'chat:private',  data => private_message(data, socket) );
   }
}

// when someone pms
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

// to add a friend
exports.add_friend = function(data, socket){
   var user = users.from_socket(socket);
   var {username} = data;
   console.log(`Trying to add friend '${username}' to ${user}`);
   if( !user || !username )
      return;
   var result = user.add_friend(username);
   if( result === true ){
      console.log(`Adding friend ${username} to ${user.username}`);
      socket.emit('friends:add', { result: 'success', username });
   } else {
      console.log(`Failed to add friend ${username} to ${user.username}`);
      socket.emit('friends:add', { result: 'failure', reason: result });
   }
}

// to delete a friend
exports.del_friend = function(data, socket){
   var user = users.from_socket(socket);
   var {username} = data;
   if( !user || !username )
      return;
   var result = user.del_friend(username);
   if( result === true )
      socket.emit('friends:del', { result: 'success', username });
   else
      socket.emit('friends:del', { result: 'failure', reason: result });
}

// to list friends
exports.list_friends = function(socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   for( var ind in user.friends )
      socket.emit('friends:list', { username: user.friends[ind] });
}

// to send a message to chat
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

// when a user left the channel
exports.user_left = function(socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   console.log(`User '${user.username}' left. `)
   io.in(user.room).emit('userlist:user_left', { username: user.username });
   user.servermsg_room(`User '${user.username}' has logged off.`);
   if( user.game )
      user.game.game.quit_game();
   users.delete_socket(socket);
}

// when a user joins the channel
exports.user_joined = function(socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   io.in(user.room).emit('userlist:user_joined', { username: user.username });
   var clients = io.sockets.adapter.rooms[user.room].sockets;

   user.servermsg_room(`User '${user.username}' has logged on.`);
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

// when someone wins
exports.game_win = function(data, socket){
  var user = users.from_socket(socket);
  if( !user )
    return;
  io.in(user.room).emit('game:winner', data);
}

// when a user takes a move
exports.take_move = function(data, socket){
   var user = users.from_socket(socket);
   if( !user )
      return;
   var pos = data.pos;
   console.log(`Player ${user.username} took a move at ${pos}`);
   io.in(user.room).emit('game:take_move', {color: user.color, x: pos, y: pos });
   // socket.on( 'game:take_move', (data) => requests.take_move(data, socket) );
}
