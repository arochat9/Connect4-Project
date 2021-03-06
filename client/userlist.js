const User = React.createClass({
   render() {
      return (
         <span className='username'>{this.props.username}</span>
      );
   }
});

const UserList = React.createClass({
   // getInitialState() {
   //    return { users:[] };
   // },

   componentDidMount() {
      socketio.emit('userlist:startup');
      socketio.on('userlist:user_joined', this.user_joined);
      socketio.on('userlist:user_left', this.user_left);
   },

   user_joined(user){
      var users = this.props.users_online.map(x => x);
      console.log("User joined: " + JSON.stringify(user));
      users.push(user);
      this.props.update_users_online(users);
   },

   user_left(user){
      var users = this.props.users_online.map(x => x);
      console.log("User left: " + JSON.stringify(user));
      users.splice(users.indexOf(user), 1);
      this.props.update_users_online(users);
   },


   render(){
      return (
         <div className='online_users'>
            <h3>Online Users {
                  this.props.chatroom === 'global' || this.props.chatroom === undefined
                     ? '' 
                     : <span>in <strong>{this.props.chatroom}</strong></span>
               }</h3>
            <ul> {
               this.props.users_online.map((user, i) => (
                  <li key={i}>
                     <User username={user.username} />
                  </li>
               ))}
            </ul>
         </div>
      );
   }
});