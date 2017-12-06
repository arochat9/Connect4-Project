const Friend = React.createClass({
   render() {
      return (
         <span className='username'>{this.props.username}</span>
      );
   }
});

const FriendsList = React.createClass({
   getInitialState() {
      return { friends:[], friend_name: '' };
   },

   componentDidMount() {
      socketio.emit('friends:startup');
      socketio.on('friends:add', this.add_friend);
      socketio.on('friends:del', this.remove_friend);
      socketio.on('friends:list', this.add_friend);
   },

   add_friend(data){
      if( data.result === 'failure' ){
         var val = `Couldn't add friend: ${data.reason}`;
         console.log(val);
         alert(val);
         return;
      }
      var friends = this.state.friends;
      let {username} = data;
      console.log("User added as friend: " + username);
      friends.push(username);
      this.setState({ friends });
   },

   remove_friend(data){
      if( data.result === 'failure' ){
         var val = `Couldn't remove friend: ${data.reason}`;
         console.log(val);
         alert(val);
         return;
      }
      var friends = this.state.friends;
      var {username} = data;
      console.log("User removed as friend: " + username);
      friends.splice(friends.indexOf(username), 1);
      this.setState({ friends });
   },

   submit(event){
      event.preventDefault();
      var username = this.state.friend_name;
      if( this.state.friends.indexOf(username) === -1 ){
         console.log(`Trying to add ${username} as a friend`);
         socketio.emit('friends:add', { username });
      } else {
         console.log(`Trying to remove ${username} as a friend`);
         socketio.emit('friends:del', { username });
      }
      this.setState({ friend_name: '' });
   },
   onchange(event){
      this.setState({ friend_name : event.target.value });
   },
   join_game(event, username){
      event.preventDefault();
      socketio.emit('game:friend', { username });
   },

   render(){
      return (
         <div className='friends'>
            <h3>Friends</h3>
            <ul> {
               this.state.friends.map((username, i) => (
                  <li key={i}>
                     <Friend username={username} />
                     { this.props.in_game(username) /*this.props.user_is_online(username)*/
                        ? null
                        : <button onClick={ event => this.join_game(event, username) }>play</button>
                     }
                  </li>
               ))}
            </ul>
            <form onSubmit={this.submit}>
               <input
                  onChange={ this.onchange }
                  value={this.state.friend_name}
                  placeholder='Friend to add/remove'
               />
            </form>

         </div>
      );
   }
});