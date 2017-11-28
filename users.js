class User {
   constructor(name, socket){
      this.name = name;
      this.socket = socket;
   }
}
class Users {
   constructor(){
      this.users = {};
   }

   add_user(user){
      var username = user.name;
      if( username == false )
         return `Invalid username ${username}`;
      if( this.users[username] )
         return `User '${username}' already is logged in.`;
      this.users[username] = user;
      return true;
   }
}

users = Users.new