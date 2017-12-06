const requests = require('./requests_handler');
const {io} = require('./app.js');


const fs = require("fs");

const saved_users = {}

function get_users(datafile){
   var users = {};
   fs.readFileSync(datafile).toString().split('\n').forEach( line => {
      var match = line.match(/^(\w+):(\w+):(\w+(?:,\w+)*|)$/);
      if( !match ){
         console.error(`Invalid line! ${line}`);
         return;
      }
      var [_, username, password, friends] = match;
      users[username] = { password, friends };
   });
   return users;
}

const DEFAULT_CHATROOM = 'global';
const DEFAULT_USERS_FILE = './data/users.data';

class User {
   constructor(username, socket, room=DEFAULT_CHATROOM){
      this.username = username;
      this.socket = socket;
      this.room = room;
   }
   set room(room){
      this._room = room;
      this.socket.emit('chat:room:change', { room });
      this.socket.join(room);
   }
   get room(){
      return this._room;
   }
   new_game(game, opponent, color, starts){
      this.room = game.room;
      this.game = { game, opponent, color, starts };
      console.log(`Sending newgame to ${this.username} (opponent=${opponent})`);
      this.socket.emit('game:begin', {
         opponent,
         color,
         starts: 'yellow',
         chatroom: this.room
      });
      var d = new Date();
      console.log(`disp (kinda) at ${d.getSeconds()}:${d.getMilliseconds()}`);
      this.socket.on('game:move', data => this.game.game.take_move(this, data) );
      this.socket.on('game:quit', this.game.game.quit_game );
   }
   servermsg_room(text){
      console.log(`Room msg for ${this.username}: ${text}`);
      io.in(this.room).emit('chat:message', {username: '<system>', text});
   }

   servermsg_private(text){
      console.log(`User msg for ${this.username}: ${text}`);
      this.socket.emit('chat:message', {username: '<system private>', text});
   }

   quit_game(){
      this.room = DEFAULT_CHATROOM;
      this.socket.emit('game:stop', { chatroom: this.room });
      delete this.game;
   }
}

const logged_in_users = {};


exports.add_user = function(username, password, socket){
   var all_users = get_users(DEFAULT_USERS_FILE);
   // if( username == false || !username.match(/^\w+$/) ) // ie empty string, undefined, whatever
   //    return 'Invalid username';
   // else if( !username.match(/^\w{5,}$/))
   //    return 'Too short of a username!';
   // else if( logged_in_users[socket.id] || exports.from_username(username) )
   //    return `User '${username}' already is logged in.`;
   // else if( !all_users[username] )
   //    return `User '${username}' doesnt exist.`;
   // else if( all_users[username].password !== password )
   //    return `Invalid password.`;
   // else
      return logged_in_users[socket.id] = new User(username, socket);
}

exports.delete_socket = function(socket){
   delete logged_in_users[socket.id];
}

exports.from_socket = function(socket){
   if( socket.id )
      return logged_in_users[socket.id];
}

exports.from_username = function(username){
   for( var socketid in logged_in_users )
      if(logged_in_users[socketid].username === username)
         return logged_in_users[socketid];
}




