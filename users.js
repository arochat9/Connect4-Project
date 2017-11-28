class User {
   constructor(name, socket){
      this.name = name;
      this.socket = socket;
   }
}

new_user = User.constructor;
function add_user(user){
   var username = user.name;
   if( username == false )
      return `Invalid username ${username}`;
   if( this.users[username] )
      return `User '${username}' already is logged in.`;
   this.users[username] = user;
   return true;
}

const users = {};

exports = [ add_user, new_user ];