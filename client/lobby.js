const User = React.createClass({
   render() {
      return (
         <span className='username'>{this.props.username}</span>
      );
   }
});

const UserList = React.createClass({
   getInitialState() {
      return { users:[] };
   },

   componentDidMount() {
      socketio.emit('userlist:startup');
      socketio.on('userlist:user_joined', this.user_joined);
      socketio.on('userlist:user_left', this.user_left);
   },

   user_joined(user){
      var users = this.state.users;
      console.log("User joined: " + JSON.stringify(user));
      users.push(user);
      this.setState({ users });
   },
   user_left(user){
      var users = this.state.users;
      console.log("User left: " + JSON.stringify(user));
      users.splice(users.indexOf(user), 1);
      this.setState({ users });
   },


   render(){
      return (
         <div className='online_users'>
            <h3>Online Users</h3>
            <ul> {
               this.state.users.map((user, i) => (
                  <li key={i}>
                     <User username={user.username} />
                  </li>
               ))}
            </ul>
         </div>
      );
   }
});

const Message = React.createClass({
   render() {
      return (
         <div className="chatlog-message">
            <User username={this.props.username} />&nbsp;&nbsp;
            <span className='chatlog-message-text'>{this.props.text}</span>
         </div>
      );
   }
});

const ChatLog = React.createClass({
   getInitialState() {
      return { messages:[] };
   },

   componentDidMount() {
      socketio.on('chat:message', this.receive_msg);
   },

   receive_msg(message){
      var messages = this.state.messages;
      console.log("Received message: " + JSON.stringify(message));
      messages.push(message);
      this.setState({ messages });
   },

   render(){
      return (
         <div className='chatlog-container'>
            <h3 className='chatlog-title'>Messages</h3>
            <ul className='chatlog-messages'>{
               this.state.messages.map((msg, i) => (
                  <Message key={i} username={msg.username} text={msg.text} />
               ))
            }</ul>
         </div>
      );
   },
});

const MessageBox = React.createClass({
   getInitialState(){
      return {text: ''}
   },

   componentDidMount(){
      socketio.emit('chat:startup');
   },

   submit(event){
      event.preventDefault();
      socketio.emit('chat:message', { text: this.state.text });
      this.setState({ text: '' });
   },

   update_text(event){
      this.setState({ text : event.target.value });
   },

   render(){
      return (
         <div>
            <h2>Hello, <User username={this.props.username} />.</h2>
            <form onSubmit={this.submit}>
               <input
                  onChange={this.update_text}
                  value={this.state.text}
                  size='120'
               />
            </form>
         </div>
      );
   }
   // <button>send</button>

});

const Lobby = React.createClass({
   render(){
      return (
         <div className='lobby-container'>
            <MessageBox username={this.props.username} />
            <UserList />
            <ChatLog />
         </div>
      );
   }
});

function startup_global_chat(username){
   ReactDOM.render(<Lobby username={username}/>, document.getElementById('lobby') );

}

function shutdown_global_chat(){

}
// ReactDOM.render(<Chatlog />, document.getElementById("global_chat"));






