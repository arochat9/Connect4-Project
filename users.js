exports = module.exports;
exports.User = class {
   constructor(name, socket){
      this.name = name;
      this.socket = socket;
   }
}

const _users = {};

expots.add_user = function(user){
   var username = user.name;
   if( username == false )
      return `Invalid username ${username}`;
   if( this.users[username] )
      return `User '${username}' already is logged in.`;
   this.users[username] = user;
   return true;
}

module.exports = {
   add_user: add_user,
   User: User
}