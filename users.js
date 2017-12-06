const requests = require('./requests_handler');
const {io} = require('./app.js');


const fs = require("fs");

const user_data = {}

exports.read_users = function(datafile){
   fs.readFileSync(datafile).toString().split('\n').forEach( line => {
      var match = line.match(/^(\w+):(\w+):(\w+(?:,\w+)*|)$/);
      if( !match ){
         console.error(`Invalid line! ${line}`);
         return;
      }
      let [_, username, password, friends] = match;
      user_data[username] = { password, friends };
   });
}


const DEFAULT_CHATROOM = 'global';

class User {
   constructor(username, socket, room=DEFAULT_CHATROOM){
      this.username = username;
      this.socket = socket;
      this.room = room;
   }
   set room(room){
      this._room = room;
      this.socket.join(room);
   }
   get room(){
      return this._room;
   }
   new_game(game, opponent, color, starts){
      this.room = game.room;
      this.game = { game, opponent, color, starts };
      this.socket.emit('game:begin', {
         opponent,
         color,
         starts: 'yellow',
         chatroom: this.room
      });
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

const users = {};


exports.add_user = function(username, password, socket){
   if( username == false || !username.match(/^\w+$/) ) // ie empty string, undefined, whatever
      return 'Invalid username';
   else if( !username.match(/^\w{5,}$/))
      return 'Too short of a username!';
   else if( users[socket.id] || exports.from_username(username) )
      return `User '${username}' already is logged in.`;
   // else if( !)
   else
      return users[socket.id] = new User(username, socket);
}

exports.delete_socket = function(socket){
   delete users[socket.id];
}

exports.from_socket = function(socket){
   if( socket.id )
      return users[socket.id];
}

exports.from_username = function(username){
   for( var socketid in users )
      if(users[socketid].username === username)
         return users[socketid];
}




