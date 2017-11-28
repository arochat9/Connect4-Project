class User {
   constructor(name, socket){
      this.name = name;
      this.socket = socket;
   }
}

const users = {};

export const new_user = User.constructor;
export function add_user(user){
   var username = user.name;
   if( username == false )
      return `Invalid username ${username}`;
   if( this.users[username] )
      return `User '${username}' already is logged in.`;
   this.users[username] = user;
   return true;
}
