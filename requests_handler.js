const users = require('./users.js'); 
const connect4 = require('./connect4.js');


exports.login_attempt = function(data, socket) {
   var username = data.username;
   var result = users.add_user(username, socket);
   if( typeof result === 'string' ){
      socket.emit('login_result', { result: 'failure', reason: result });
      console.log(`Couldn't log in user '${username}': ${result}`);
   } else {
      var user = result;
      socket.emit('login_result', { result: 'success', username: user.name });
      console.log(`User '${username}' logged in.`);
      connect4.send_active(user);
   }
}