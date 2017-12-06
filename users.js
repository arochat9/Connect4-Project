const requests = require('./requests_handler');
const {io} = require('./app.js');


const fs = require("fs");

var saved_users = {}

// get the list of users from the data file
function get_users(datafile){
   saved_users = {};
   fs.readFileSync(datafile).toString().split('\n').forEach( line => {
      var match = line.match(/^(\w+):(\w+):(\w+(?:,\w+)*|)$/);
      if( !line.trim() )
         return;
      if( !match ){
         console.error(`Invalid line! ${line}`);
         return;
      }
      var [_, username, password, friends] = match;
      var friends = friends.split(',').filter(f => f);
      saved_users[username] = { password, friends };
   });
   return saved_users;
}

// save the users to the datafile
function save_users(datafile){
   var content = '';
   for( var user in saved_users )
      content += `${user}:${saved_users[user].password}:${saved_users[user].friends.join(',')}\n`;
   fs.writeFileSync(datafile, content, 'utf8');
}

// add a new user
function append_user(datafile, username, password){
   fs.appendFileSync(datafile, `${username}:${password}:\n`);
}

const DEFAULT_CHATROOM = 'global';
const DEFAULT_USERS_FILE = './data/users.data';

// user class
class User {
   // create a user
   constructor(username, socket, room=DEFAULT_CHATROOM){
      this.username = username;
      this.socket = socket;
      this.room = room;
      this.friends = get_users(DEFAULT_USERS_FILE)[username].friends;
   }
   // set the user's room
   set room(room){
      // this.socket.leave(this.room);
      this._room = room;
      this.socket.emit('chat:room:change', { room });
      this.socket.join(room);
   }
   // get the room
   get room(){
      return this._room;
   }
   // starta game for this player
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
   // message everyone as the server in this user's room
   servermsg_room(text){
      console.log(`Room msg for ${this.username}: ${text}`);
      io.in(this.room).emit('chat:message', {username: '<system>', text});
   }
   // message this user as the server
   servermsg_private(text){
      console.log(`User msg for ${this.username}: ${text}`);
      this.socket.emit('chat:message', {username: '<system private>', text});
   }
   // have this user quit the game
   quit_game(){
      this.room = DEFAULT_CHATROOM;
      this.socket.emit('game:stop', { chatroom: this.room });
      delete this.game;
   }
   // add a friend to this user
   add_friend(friend){
      if( friend == false || !friend.match(/^\w+$/) ) // ie empty string, undefined, whatever
         return 'Invalid username';
      else if( !friend.match(/^\w{5,}$/))
         return 'Too short of a username!';

      if( this.friends.indexOf(friend) === -1)
         this.friends.push( friend );
      else
         return 'friend already exists';
      save_users(DEFAULT_USERS_FILE);
      return true;
   }
   // deleete a friend from this user
   del_friend(friend){
      if( this.friends.indexOf(friend) === -1)
         return 'friend doesnt exist';
      else {
         this.friends.splice( this.friends.indexOf(friend), 1);
         save_users(DEFAULT_USERS_FILE);
         return true;
      }
   }
}

const logged_in_users = {};



exports.register_user = function(username, password){
   if( username == false || !username.match(/^\w+$/) ) // ie empty string, undefined, whatever
      return 'Invalid username';
   else if( !username.match(/^\w{5,}$/))
      return 'Too short of a username!';
   else if( get_users(DEFAULT_USERS_FILE)[username] )
      return 'Username already exists!';
   else {
      append_user(DEFAULT_USERS_FILE, username, password);
      return true;
   }
}

exports.add_user = function(username, password, socket){
   var all_users = get_users(DEFAULT_USERS_FILE);
   if( username == false || !username.match(/^\w+$/) ) // ie empty string, undefined, whatever
      return 'Invalid username';
   else if( !all_users[username] )
      return `User '${username}' doesnt exist.`;
   else if( !username.match(/^\w{5,}$/))
      return 'Too short of a username!';
   else if( logged_in_users[socket.id] || exports.from_username(username) )
      return `User '${username}' already is logged in.`;
   else if( all_users[username].password !== password )
      return `Invalid password.`;
   else
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




