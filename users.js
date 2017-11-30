// exports = module.exports;
class User {
   constructor(name, socket){
      this.name = name;
      this.socket = socket;
   }
}

const users = {};

exports.add_user = function(username, socket){;
   if( username == false ) // ie empty string, undefined, whatever
      return `Invalid username ${username}`;
   else if( users[username] )
      return `User '${username}' already is logged in.`;
   else 
      return users[username] = new User(username, socket);
}