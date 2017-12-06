class User {
   constructor(username, socket, room='global'){
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
   start_game(color, room){
      this.color = color;
      this.room = room;
   }
}

const users = {};

exports.add_user = function(username, socket){
   if( username == false ) // ie empty string, undefined, whatever
      return `Invalid username ${username}`;
   else if( users[socket.id] )
      return `User '${username}' already is logged in.`;
   else
      return users[socket.id] = new User(username, socket);
}

exports.delete_socket = function(socket){
   delete users[socket.id];
}

exports.from_socket = function(socket){
   return users[socket.id];
}
