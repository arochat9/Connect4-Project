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
}




















