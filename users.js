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

   add_user(username, socket){
      this.users[username] = new User(username, socket);
   }

   login_user(username, socket){
      if( this.users[username] ){
         socket.emit('client-login-result', {
            result: 'failure',
            reason: `User '${username}' already is logged in.`
         });
         return false;
      } else {
         this.add_user(username, socket);
         socket.emit('client-login-result', {
            result: 'success',
            username: username
         });
         return true;
      }
   }
}

users = Users.new